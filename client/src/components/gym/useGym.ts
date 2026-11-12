import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GymExercise, GymLog, InsertGymExercise, InsertGymLogBatch } from "@shared/schema";
import { estimate1RM, normalize, type GymPlan } from "@shared/gym";

export const LOGS_KEY = ["/api/gym/me"];
export const EXERCISES_KEY = ["/api/gym/exercises"];
export const PLAN_KEY = ["/api/gym/plan"];

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
    onSuccess: (plan) => { queryClient.setQueryData<GymPlan>(PLAN_KEY, plan); },
    onError: () => { void queryClient.invalidateQueries({ queryKey: PLAN_KEY }); },
  });

  /** Cambia el peso objetivo de un ejercicio en todos los días del plan donde aparece */
  const setPlanWeight = (exercise: string, weight: number) => {
    const plan = planQ.data;
    if (!plan) return;
    savePlan.mutate({
      ...plan,
      days: plan.days.map((d) => ({ ...d, items: d.items.map((i) => (i.exercise === exercise ? { ...i, weight } : i)) })),
    });
  };

  const removeExercise = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/gym/exercises/${id}`); return id; },
    onSuccess: (id) => queryClient.setQueryData<GymExercise[]>(EXERCISES_KEY, (old = []) => old.filter((e) => e.id !== id)),
  });

  return {
    logs, exercises, statsFor, plan: planQ.data ?? null, savePlan, setPlanWeight,
    loading: logsQ.isLoading || exQ.isLoading,
    logBatch, deleteLogs, addExercise, removeExercise,
  };
}

export type GymApi = ReturnType<typeof useGym>;
