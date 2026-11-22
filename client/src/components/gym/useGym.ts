import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GymDay, GymExercise, GymLog, GymPrefs, InsertGymExercise, InsertGymLogBatch } from "@shared/schema";
import {
  coach, convertWeight, estimate1RM, fmtW, isoDow, normalize, sessionsOf, todayKey, type GymPlan, type PlanItem, type Unit, type Verdict,
} from "@shared/gym";

export const LOGS_KEY = ["/api/gym/me"];
export const EXERCISES_KEY = ["/api/gym/exercises"];
export const PLAN_KEY = ["/api/gym/plan"];
export const DAYS_KEY = ["/api/gym/days"];
export const PREFS_KEY = ["/api/gym/prefs"];

/** Cambio de peso aplicado por el entrenador (para poder deshacerlo) */
export type PlanChange = { exercise: string; from: number | null; to: number | null; day: string };

export type ExerciseStats = {
  best: number;          // peso máximo levantado
  best1RM: number;       // 1RM estimado máximo
  last?: GymLog;
  sessions: number;      // días distintos con este ejercicio
  /** peso máximo por día, en orden cronológico (para el sparkline) */
  series: { day: string; weight: number }[];
};

const dayKey = (d: string | Date) => new Date(d).toLocaleDateString("sv-SE"); // YYYY-MM-DD local

export function useGym(enabled: boolean) {
  const logsQ = useQuery<GymLog[]>({ queryKey: LOGS_KEY, enabled });
  const exQ = useQuery<GymExercise[]>({ queryKey: EXERCISES_KEY, enabled });
  const planQ = useQuery<GymPlan | null>({ queryKey: PLAN_KEY, enabled });
  const daysQ = useQuery<GymDay[]>({ queryKey: DAYS_KEY, enabled });
  const prefsQ = useQuery<GymPrefs>({ queryKey: PREFS_KEY, enabled });
  const unit: Unit = prefsQ.data?.unit ?? "kg";
  /** Peso guardado (kg) → texto en la unidad del usuario */
  const w = (kg: number) => fmtW(kg, unit);
  const logs = logsQ.data ?? [];
  const exercises = exQ.data ?? [];

  const stats = useMemo(() => {
    const map = new Map<string, ExerciseStats>();
    // logs llega ordenado por fecha desc
    for (const l of [...logs].reverse()) {
      const k = normalize(l.exercise);
      const s = map.get(k) ?? { best: 0, best1RM: 0, sessions: 0, series: [] };
      s.best = Math.max(s.best, l.weight);
      s.best1RM = Math.max(s.best1RM, estimate1RM(l.weight, l.reps));
      s.last = l;
      const day = dayKey(l.date);
      const point = s.series[s.series.length - 1];
      if (point?.day === day) point.weight = Math.max(point.weight, l.weight);
      else { s.series.push({ day, weight: l.weight }); s.sessions++; }
      map.set(k, s);
    }
    return map;
  }, [logs]);

  const statsFor = (name: string) => stats.get(normalize(name));

  const logBatch = useMutation({
    mutationFn: async (batch: InsertGymLogBatch) => (await apiRequest("POST", "/api/gym/batch", batch)).json() as Promise<GymLog[]>,
    onSuccess: (saved) => {
      queryClient.setQueryData<GymLog[]>(LOGS_KEY, (old = []) =>
        [...saved, ...old].sort((a, b) => +new Date(b.date) - +new Date(a.date)));
    },
  });

  const deleteLogs = useMutation({
    mutationFn: async (ids: string[]) => { await apiRequest("POST", "/api/gym/delete", { ids }); return ids; },
    onSuccess: (ids) => queryClient.setQueryData<GymLog[]>(LOGS_KEY, (old = []) => old.filter((l) => !ids.includes(l.id))),
  });

  const addExercise = useMutation({
    mutationFn: async (ex: InsertGymExercise) => (await apiRequest("POST", "/api/gym/exercises", ex)).json() as Promise<GymExercise>,
    onSuccess: (row) => queryClient.setQueryData<GymExercise[]>(EXERCISES_KEY, (old = []) => [...old, row]),
  });

  const savePlan = useMutation({
    mutationFn: async (plan: GymPlan) => (await apiRequest("PUT", "/api/gym/plan", plan)).json() as Promise<GymPlan>,
    onMutate: (plan) => { queryClient.setQueryData<GymPlan>(PLAN_KEY, plan); }, // optimista: el peso cambia al instante
    onError: () => { void queryClient.invalidateQueries({ queryKey: PLAN_KEY }); },
  });

  const mapItems = (plan: GymPlan, exercise: string, fn: (i: PlanItem) => PlanItem): GymPlan => ({
    ...plan,
    days: plan.days.map((d) => ({ ...d, items: d.items.map((i) => (i.exercise === exercise ? fn(i) : i)) })),
  });
  /** Lee la caché directamente: dentro de un mismo handler, `logs` aún no refleja lo recién guardado */
  const freshLogs = () => queryClient.getQueryData<GymLog[]>(LOGS_KEY) ?? logs;
  const currentPlan = () => queryClient.getQueryData<GymPlan | null>(PLAN_KEY) ?? planQ.data ?? null;
  /** Escribe en caché de forma síncrona (onMutate es asíncrono: dos cambios seguidos se pisarían) y guarda */
  const commitPlan = (plan: GymPlan) => { queryClient.setQueryData<GymPlan>(PLAN_KEY, plan); savePlan.mutate(plan); };

  /** Cambio manual del peso objetivo en todos los días del plan donde aparece (olvida el cambio automático) */
  const setPlanWeight = (exercise: string, weight: number) => {
    const plan = currentPlan();
    if (!plan) return;
    commitPlan(mapItems(plan, exercise, ({ progressedOn, prevWeight, ...i }) => ({ ...i, weight })));
  };

  const pattern = (exercise: string) => exercises.find((e) => e.name === exercise)?.pattern ?? "";
  const planItem = (exercise: string) => currentPlan()?.days.flatMap((d) => d.items).find((i) => normalize(i.exercise) === normalize(exercise));
  const verdictFor = (it: PlanItem, withLogs: { exercise: string; weight: number; sets: number; reps: number; date: string | Date }[] = freshLogs()) =>
    coach(it, withLogs, pattern(it.exercise));

  /**
   * Aplica el veredicto de la sesión al plan (sube / descarga). Idempotente: si ya se aplicó por
   * esa sesión, recalcula desde el peso anterior. Devuelve el cambio o null si no hay nada que cambiar.
   */
  const applyVerdict = (it: PlanItem, v: Verdict): PlanChange | null => {
    const plan = currentPlan();
    if (!plan || !v.session || (v.kind !== "up" && v.kind !== "deload")) return null;
    if (v.next === it.weight) return null;
    const day = v.session.day;
    if (it.progressedOn === day && it.weight === v.next) return null; // ya aplicado por esta sesión
    const from = it.progressedOn === day ? (it.prevWeight ?? null) : it.weight;
    commitPlan(mapItems(plan, it.exercise, (i) => ({ ...i, weight: v.next, progressedOn: day, prevWeight: from })));
    return { exercise: it.exercise, from, to: v.next, day };
  };

  /** Deshace un cambio automático (solo si el plan sigue con ese peso) */
  const revertChange = (c: PlanChange) => {
    const plan = currentPlan();
    if (!plan) return;
    commitPlan(mapItems(plan, c.exercise, ({ progressedOn, prevWeight, ...i }) =>
      i.weight === c.to ? { ...i, weight: c.from } : { ...i, progressedOn, prevWeight }));
  };

  // ── Marcadores del día ──
  const days = daysQ.data ?? [];
  const dayRow = (day = todayKey()) => days.find((d) => d.day === day);
  const saveDay = useMutation({
    mutationFn: async ({ day, done, completed }: { day: string; done: string[]; completed: boolean }) =>
      (await apiRequest("PUT", `/api/gym/days/${day}`, { done, completed })).json() as Promise<GymDay>,
    onError: () => { void queryClient.invalidateQueries({ queryKey: DAYS_KEY }); },
  });
  const putDay = (day: string, done: string[], completed: boolean) => {
    const prev = queryClient.getQueryData<GymDay[]>(DAYS_KEY) ?? [];
    const old = prev.find((d) => d.day === day);
    const row = { userId: old?.userId ?? "", day, done, completedAt: completed ? (old?.completedAt ?? new Date()) : null } as GymDay;
    queryClient.setQueryData<GymDay[]>(DAYS_KEY, [row, ...prev.filter((d) => d.day !== day)]);
    saveDay.mutate({ day, done, completed });
  };
  const latestDay = (day: string) => queryClient.getQueryData<GymDay[]>(DAYS_KEY)?.find((d) => d.day === day) ?? dayRow(day);
  const toggleDone = (id: string, on?: boolean, day = todayKey()) => {
    const row = latestDay(day);
    const done = row?.done ?? [];
    const next = (on ?? !done.includes(id)) ? Array.from(new Set([...done, id])) : done.filter((d) => d !== id);
    putDay(day, next, !!row?.completedAt);
  };
  const setCompleted = (completed: boolean, day = todayKey()) => {
    const row = latestDay(day);
    putDay(day, row?.done ?? [], completed);
  };

  const savePrefs = useMutation({
    mutationFn: async (st: GymPrefs) => (await apiRequest("PUT", "/api/gym/prefs", st)).json() as Promise<GymPrefs>,
    onError: () => { void queryClient.invalidateQueries({ queryKey: PREFS_KEY }); },
  });
  /** Cambia la unidad para todo: lo que se muestra, los números sin unidad del chat y los pesos de la rutina */
  const setUnit = (next: Unit) => {
    if (next === unit) return;
    queryClient.setQueryData<GymPrefs>(PREFS_KEY, { unit: next });
    savePrefs.mutate({ unit: next });
    const plan = currentPlan();
    if (!plan) return;
    const conv = (v: number | null | undefined, from: Unit) => (v === null || v === undefined ? v : convertWeight(v, from, next));
    commitPlan({
      ...plan,
      days: plan.days.map((d) => ({
        ...d,
        items: d.items.map((i) => (i.unit === next ? i : {
          ...i, unit: next, weight: conv(i.weight, i.unit) as number | null,
          ...(i.prevWeight !== undefined ? { prevWeight: conv(i.prevWeight, i.unit) as number | null } : {}),
        })),
      })),
    });
  };

  /** Resumen de hoy frente al plan: ejercicios hechos, series, volumen y cambios de peso */
  const todaySummary = (withLogs = freshLogs()) => {
    const day = todayKey();
    const planDay = currentPlan()?.days.find((d) => d.dow === isoDow());
    const marked = new Set(latestDay(day)?.done ?? []);
    const todays = withLogs.filter((l) => todayKey(new Date(l.date)) === day);
    const items = (planDay?.items ?? []).map((it) => {
      const s = sessionsOf(it.exercise, todays)[0];
      const variantLogs = todays.filter((l) => "variantOf" in l && l.variantOf && normalize(l.variantOf as string) === normalize(it.exercise));
      const variants = Array.from(new Set(variantLogs.map((l) => l.exercise)));
      const sets = (s?.reps.length ?? 0) + variantLogs.reduce((a, l) => a + l.sets, 0);
      return { it, sets, done: marked.has(it.exercise) || sets >= it.sets, session: s, variants };
    });
    const blockIds = (planDay?.blocks ?? []).flatMap((b) => b.lines.map((l) => `${b.title}/${l}`));
    return {
      day, planDay, items,
      blocksDone: blockIds.filter((id) => marked.has(id)).length, blocksTotal: blockIds.length,
      sets: todays.reduce((a, l) => a + l.sets, 0),
      volume: todays.reduce((a, l) => a + l.weight * l.sets * l.reps, 0),
      exercisesLogged: new Set(todays.map((l) => normalize(l.exercise))).size,
      completed: !!latestDay(day)?.completedAt,
    };
  };

  const removeExercise = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/gym/exercises/${id}`); return id; },
    onSuccess: (id) => queryClient.setQueryData<GymExercise[]>(EXERCISES_KEY, (old = []) => old.filter((e) => e.id !== id)),
  });

  return {
    logs, exercises, statsFor, plan: planQ.data ?? null, savePlan, setPlanWeight,
    unit, w, setUnit,
    freshLogs, pattern, planItem, verdictFor, applyVerdict, revertChange,
    days, dayRow, toggleDone, setCompleted, todaySummary,
    loading: logsQ.isLoading || exQ.isLoading,
    logBatch, deleteLogs, addExercise, removeExercise,
  };
}

export type GymApi = ReturnType<typeof useGym>;
