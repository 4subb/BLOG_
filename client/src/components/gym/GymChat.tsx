import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Equal, Pencil, Plus, Redo2, Undo2 } from "lucide-react";
import type { GymExercise, GymLog } from "@shared/schema";
import {
  EQUIPMENT_LABELS, EXERCISE_LIBRARY, MUSCLE_GROUPS, MUSCLE_LABELS, estimate1RM, findInLibrary, formatKg, fromKg, isoDow,
  exerciseKey, parseWorkoutMessage, planWeightKg, sameExercise, suggestExercises, todayKey, toKgFrom, variantsFor,
  type CatalogItem, type HistoryItem, type MovementPattern, type MuscleGroup, type ParsedEntry, type Verdict,
} from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import Barbell from "./Barbell";
import LogEditor, { type LogFields } from "./LogEditor";
import { queryClient } from "@/lib/queryClient";
import { EXERCISES_KEY, type GymApi, type PlanChange } from "./useGym";

// Chat de registro: el usuario escribe como hablaría ("banca 80 3x10 y sentadilla 100 5x5"),
// shared/gym.ts lo interpreta en local (sin IA externa) y se guarda al instante con opción de deshacer.

type Saved = { id: string; exercise: string; weight: number; sets: number; reps: number; pr: boolean; assumed: ParsedEntry["assumed"]; variantOf?: string | null };
/** Alternativas ofrecidas en el chat: al tocarlas se precarga el mensaje */
type Variants = { of: string; options: { name: string; sub: string; prefill: string }[] };
/** Respuesta del entrenador tras registrar: progreso de la sesión o veredicto con el cambio de peso */
type Coach = {
  exercise: string; kind: Verdict["kind"]; goal: string; why: string; tip?: string;
  change?: PlanChange & { unit: string }; reverted?: boolean;
};
type Summary = { title: string; done: number; total: number; sets: number; volume: number; pending: string[]; changes: string[] };
type BotMsg = Extract<Msg, { role: "bot" }>;
type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; text: string; saved?: Saved[]; dayOffset?: number; undone?: boolean; coach?: Coach[]; summary?: Summary; notes?: string[]; variants?: Variants;
      /** Ejercicio desconocido pendiente de añadir al catálogo */
      unknown?: { name: string; entries: ParsedEntry[]; dayOffset: number; resolved?: boolean; suggestions?: string[] } };
type Unit = GymApi["unit"];

const DEFAULT_PATTERN: Record<MuscleGroup, MovementPattern> = {
  pecho: "press", espalda: "row", piernas: "squat", hombros: "raise", brazos: "curl", core: "core",
};
const BARBELL = new Set(["press", "incline", "squat", "hinge", "overhead"]);
const uid = () => Math.random().toString(36).slice(2, 10);

export default function GymChat({ gym, userId, prefill }: { gym: GymApi; userId: string; prefill?: { text: string; n: number } }) {
  const { L, locale } = useLang();
  const storageKey = `gym-chat:${userId}`;
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]"); } catch { return []; }
  });
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const sending = useRef(false); // evita registrar dos veces el mismo envío
  // Ejercicio anunciado ("hoy sentadilla") pero aún sin series: lo siguiente va a él
  const activeKey = `gym-active:${userId}`;
  const [active, setActiveState] = useState<{ exercise: string; at: number } | null>(() => {
    try { return JSON.parse(localStorage.getItem(activeKey) ?? "null"); } catch { return null; }
  });
  const setActive = (exercise: string | null) => {
    const v = exercise ? { exercise, at: Date.now() } : null;
    setActiveState(v);
    localStorage.setItem(activeKey, JSON.stringify(v));
  };
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-40))); }, [msgs, storageKey]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs]);
  useEffect(() => {
    if (!prefill?.text) return;
    setText(prefill.text);
    inputRef.current?.focus();
  }, [prefill?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const push = (...m: Msg[]) => setMsgs((prev) => [...prev, ...m]);
  const patch = (id: string, fn: (m: Msg) => Msg) => setMsgs((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  // Catálogo propio primero (gana en empates) + biblioteca de ejercicios conocidos que aún no tiene:
  // si registra uno de la biblioteca, se añade solo a su catálogo con su animación y alias.
  // Los ejercicios de la rutina de hoy van primero: ganan los empates ("remo listo" → el remo de tu rutina).
  // Los de la rutina que no están en el catálogo también cuentan.
  const catalog = (): CatalogItem[] => {
    const planItems = gym.plan?.days.flatMap((d) => d.items) ?? [];
    const todayItems = gym.plan?.days.find((d) => d.dow === isoDow())?.items ?? [];
    const names = Array.from(new Set([
      ...todayItems.map((i) => i.exercise), ...planItems.map((i) => i.exercise), ...gym.exercises.map((e) => e.name), ...EXERCISE_LIBRARY.map((e) => e.name),
    ]));
    const todayKeys = new Set(todayItems.map((i) => exerciseKey(i.exercise)));
    return names.map((name) => {
      const own = gym.exercises.find((e) => e.name === name);
      const def = EXERCISE_LIBRARY.find((e) => sameExercise(e.name, name));
      const item = planItems.find((i) => sameExercise(i.exercise, name));
      return {
        name,
        aliases: Array.from(new Set([...(own?.aliases ?? []), ...(def?.aliases ?? [])])),
        bodyweight: own?.bodyweight ?? !!def?.bodyweight,
        today: todayKeys.has(exerciseKey(name)),
        // La rutina lo mide "en total" aunque lo normal sea por mano: lo hace con otro material
        anyEquipment: !!def?.perHand && item?.per === "total" && item.weight !== null,
      };
    });
  };
  /** Añade al catálogo los de la biblioteca que falten. Si falla no impide registrar. */
  const adopted = async (entries: ParsedEntry[]) => {
    const missing = Array.from(new Set(entries.map((e) => e.exercise))).filter((n) => !gym.exercises.some((e) => sameExercise(e.name, n)));
    const added: string[] = [];
    for (const n of missing) {
      const def = EXERCISE_LIBRARY.find((e) => sameExercise(e.name, n));
      if (!def) continue;
      try {
        await gym.addExercise.mutateAsync({ name: n, muscleGroup: def.muscleGroup, pattern: def.pattern, aliases: def.aliases.slice(0, 12), bodyweight: !!def.bodyweight });
        added.push(n);
      } catch { /* ya estaba (otro dispositivo): se registra igual */ }
    }
    return added;
  };

  async function save(entries: ParsedEntry[], dayOffset: number): Promise<Saved[]> {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    // Récord = supera el mejor peso previo (calculado antes de guardar)
    const prevBest = new Map(entries.map((e) => [e.exercise, gym.statsFor(e.exercise)?.best ?? 0]));
    const rows: GymLog[] = await gym.logBatch.mutateAsync({
      date: dayOffset ? date : undefined,
      entries: entries.map((e) => ({ exercise: e.exercise, weight: e.weight!, sets: e.sets!, reps: e.reps!, variantOf: e.variantOf ?? null })),
    });
    return rows.map((r, i) => {
      const best = prevBest.get(r.exercise) ?? 0;
      const pr = r.weight > 0 && r.weight > best && (gym.statsFor(r.exercise)?.sessions ?? 0) > 0;
      if (pr) prevBest.set(r.exercise, r.weight);
      return { id: r.id, exercise: r.exercise, weight: r.weight, sets: r.sets, reps: r.reps, pr, assumed: entries[i]?.assumed ?? [], variantOf: r.variantOf };
    });
  }

  /** Ejercicio en curso: el último registrado hoy, si no se marcó como terminado */
  const lastToday = () => {
    const last = gym.freshLogs().find((l) => todayKey(new Date(l.date)) === todayKey());
    if (!last || gym.dayRow()?.done.includes(last.exercise) || (last.variantOf && gym.dayRow()?.done.includes(last.variantOf))) return null;
    return last;
  };
  /** Contexto del chat: lo anunciado ("hoy sentadilla") gana si es posterior al último registro */
  const context = () => {
    const last = lastToday();
    if (active && todayKey(new Date(active.at)) === todayKey() && (!last || active.at > +new Date(last.date))
      && !gym.dayRow()?.done.includes(active.exercise)) return { exercise: active.exercise, variantOf: null };
    return last ? { exercise: last.exercise, variantOf: last.variantOf } : null;
  };
  const currentExercise = () => context()?.exercise ?? null;

  const coachLine = (it: NonNullable<ReturnType<GymApi["planItem"]>>, v: Verdict, change: PlanChange | null): Coach => ({
    exercise: it.exercise, kind: v.kind, goal: L(v.goal.es, v.goal.en), why: L(v.why.es, v.why.en),
    tip: v.tip ? L(v.tip.es, v.tip.en) : undefined,
    change: change ? { ...change, unit: it.unit } : undefined,
  });

  /** Tras guardar: por cada ejercicio de la rutina, cuántas series lleva o, si cerró, el veredicto (y se aplica) */
  const coachAfter = (names: string[]): Coach[] =>
    Array.from(new Set(names)).flatMap((name) => {
      const it = gym.planItem(name);
      if (!it) return [];
      const v = gym.verdictFor(it);
      return [coachLine(it, v, v.kind === "incomplete" ? null : gym.applyVerdict(it, v))];
    });

  function summary(): Summary {
    const s = gym.todaySummary();
    const fmt = (w: number | null | undefined) => (w === null || w === undefined ? "—" : formatKg(w));
    const changes = s.items.flatMap(({ it }) =>
      it.progressedOn === s.day && it.weight !== (it.prevWeight ?? null)
        ? [`${it.exercise} ${fmt(it.prevWeight)} → ${fmt(it.weight)} ${it.unit}`]
        : []);
    return {
      title: s.planDay?.title ?? L("Entreno libre", "Free session"),
      done: s.items.filter((i) => i.done).length + s.blocksDone, total: s.items.length + s.blocksTotal,
      sets: s.sets, volume: Math.round(s.volume),
      pending: s.items.filter((i) => !i.done).map((i) => i.it.exercise), changes,
    };
  }

  const describe = (e: { exercise: string; weight: number | null; sets: number | null; reps: number | null }) =>
    `${e.exercise} ${e.sets ?? "?"}×${e.reps ?? "?"}${e.weight ? ` @ ${gym.w(e.weight)}` : ""}`;
  const vol = (kg: number) => `${Math.round(fromKg(kg, gym.unit)).toLocaleString(locale)} ${gym.unit}`;

  /** Notas para registros que son variante: cuentan para el ejercicio de la rutina, sin tocar su progresión */
  const variantNotes = (saved: Saved[]) => {
    const sum = gym.todaySummary();
    return Array.from(new Set(saved.filter((x) => x.variantOf).map((x) => x.variantOf!))).map((orig) => {
      const item = sum.items.find((i) => sameExercise(i.it.exercise, orig));
      const prog = item ? ` (${Math.min(item.sets, item.it.sets)}/${item.it.sets} ${L("series", "sets")})` : "";
      return L(
        `↔ Variante de ${orig}: cuenta para tu rutina de hoy${prog}. El peso de ${orig} no cambia.`,
        `↔ Variant of ${orig}: counts toward today's routine${prog}. ${orig}'s weight stays the same.`);
    });
  };

  /** Alternativas para un ejercicio, con peso de partida en la unidad del usuario */
  function variantOptions(of: string): Variants {
    const it = gym.planItem(of);
    const lastKg = gym.statsFor(of)?.last?.weight ?? (it ? planWeightKg(it) : null);
    const sets = it?.sets ?? 3;
    const opts = variantsFor(of, gym.exercises, lastKg).slice(0, 6).map((o) => {
      const start = o.startKg ? `${formatKg(fromKg(o.startKg, gym.unit) >= 20 ? Math.round(fromKg(o.startKg, gym.unit)) : fromKg(o.startKg, gym.unit))} ${gym.unit}` : null;
      const eq = o.equipment ? L(EQUIPMENT_LABELS[o.equipment].es, EQUIPMENT_LABELS[o.equipment].en) : "";
      const sub = [eq, start ? `≈ ${start}${o.perHand ? L(" por mano", " per hand") : ""}` : o.bodyweight ? L("peso corporal", "bodyweight") : ""].filter(Boolean).join(" · ");
      const num = start ? `${start.replace(" ", "")} ` : "";
      return { name: o.name, sub, prefill: `${o.name.toLowerCase()} ${num}${sets}x en vez de ${of.toLowerCase()}` };
    });
    return { of, options: opts };
  }

  async function handle(raw: string) {
    const input = raw.trim();
    if (!input || sending.current) return;
    sending.current = true;
    try { await respond(input); } finally { sending.current = false; }
  }

  async function respond(input: string) {
    push({ id: uid(), role: "user", text: input });
    setText("");
    // Si falta peso/series y no hay historial, se usa el objetivo de la rutina (fecha 0 = más antiguo que cualquier registro)
    const fromPlan: HistoryItem[] = (gym.plan?.days ?? []).flatMap((d) => d.items)
      .filter((i) => i.reps !== "max" && i.weight !== null)
      .map((i) => ({ exercise: i.exercise, weight: planWeightKg(i)!, sets: i.sets, reps: (i.reps as [number, number])[0], date: new Date(0) }));
    const ctxLog = context();
    const cat = catalog();
    const r = parseWorkoutMessage(input, cat, [...gym.freshLogs(), ...fromPlan], ctxLog?.exercise ?? null, gym.unit);
    // Serie a serie de una variante en curso: hereda a qué ejercicio sustituye
    if (r.intent === "log" && ctxLog?.variantOf) {
      for (const e of r.entries) if (!e.variantOf && e.exercise === ctxLog.exercise) e.variantOf = ctxLog.variantOf;
    }

    try {
      if (r.intent === "help") {
        push({ id: uid(), role: "bot", text: L(
          "Escríbeme como lo dirías: «banca 80kg 3x10», «sentadilla 100 5x5 y peso muerto 140x3», «banca 60x10, 70x8, 80x6» (una serie por peso), «ayer dominadas 4x8», «militar 3 series de 8 con 42,5kg». Serie a serie: «dominadas primera serie 10», luego «segunda serie 8», «7»… (sigo con el mismo ejercicio). Al completar las series te digo si toca subir, mantener o descargar, y ajusto tu rutina. «remo listo» marca un ejercicio; «terminé» cierra la rutina del día. Variantes: «press mancuernas 26 3x10 en vez de banca» (cuenta para banca sin cambiar su peso); «alternativas a banca» o «máquina ocupada» te da opciones. Unidades: «135 lb 3x8» o, sin unidad, la que elijas arriba (kg/lb); «135 lb a kg» convierte. Entiendo abreviaturas y erratas: lib, rep, ser, sent, domi… Para empezar un ejercicio: «hoy sentadilla en barra libre» y luego solo «8 con 70», «7»… Si algo quedó mal: «no, era sentadilla hack», «eran 70kg», o el lápiz del registro. También: «récord en banca», «deshacer» y «rehacer».",
          "Write it like you'd say it: \"bench 80kg 3x10\", \"squat 100 5x5 and deadlift 140x3\", \"bench 60x10, 70x8, 80x6\" (one set per weight), \"ayer pull ups 4x8\". If you skip the weight or sets I reuse your last session. Set by set: \"pull ups first set 10\", then \"second set 8\", \"7\"… When all sets are in I tell you whether to go up, hold or deload, and update your routine. \"row done\" ticks an exercise; \"finished\" closes the day. Variants: \"dumbbell press 26 3x10 en vez de bench\" (counts for bench, keeps its weight); \"alternatives to bench\" or \"machine busy\" suggests options. Units: \"135 lb 3x8\" or, without a unit, the one picked above (kg/lb); \"135 lb to kg\" converts. Typos and short forms are fine. Fix mistakes with \"era sentadilla hack\" or the pencil. Also: \"pr bench\", \"undo\" and \"redo\".") });
        return;
      }

      if (r.intent === "undo") {
        const last = [...msgs].reverse().find((m): m is Extract<Msg, { role: "bot" }> => m.role === "bot" && !!m.saved?.length && !m.undone);
        if (!last?.saved) { push({ id: uid(), role: "bot", text: L("No hay nada reciente que deshacer.", "Nothing recent to undo.") }); return; }
        await undo(last.id, last.saved, last.coach);
        push({ id: uid(), role: "bot", text: L(`Listo, borré ${last.saved.length} registro(s).`, `Done, removed ${last.saved.length} entr${last.saved.length === 1 ? "y" : "ies"}.`) });
        return;
      }

      if (r.intent === "redo") {
        const last = [...msgs].reverse().find((m): m is BotMsg => m.role === "bot" && !!m.saved?.length && !!m.undone && gym.trashedLogs(m.saved.map((x) => x.id)).length > 0);
        if (last) { await redo(last); push({ id: uid(), role: "bot", text: L("Listo, lo restauré.", "Done, restored it.") }); return; }
        const t = gym.trashed[0];
        if (!t) { push({ id: uid(), role: "bot", text: L("No hay nada que rehacer.", "Nothing to redo.") }); return; }
        await gym.restoreLogs.mutateAsync(t.logs);
        push({ id: uid(), role: "bot", text: L(`Restaurado: ${t.logs.map(describe).join(", ")}.`, `Restored: ${t.logs.map(describe).join(", ")}.`) });
        return;
      }

      if (r.intent === "fix") {
        const last = [...msgs].reverse().find((m): m is BotMsg => m.role === "bot" && !!m.saved?.length && !m.undone);
        const alive = new Set(gym.freshLogs().map((l) => l.id));
        // Corrige el último ejercicio registrado (todas sus series si solo cambia el nombre)
        const rows = (last?.saved ?? []).filter((x) => alive.has(x.id));
        const tail = rows.filter((x) => x.exercise === rows[rows.length - 1].exercise);
        const numbers = r.weight !== null || r.sets !== null || r.reps !== null;
        const targets = numbers && (r.sets !== null || r.reps !== null) ? tail.slice(-1) : tail;
        if (!last || !targets.length) { push({ id: uid(), role: "bot", text: L("No hay un registro reciente que corregir.", "No recent entry to fix.") }); return; }
        const fields: Partial<LogFields> = {
          ...(r.exercise ? { exercise: r.exercise } : {}), ...(r.weight !== null ? { weight: r.weight } : {}),
          ...(r.sets !== null ? { sets: r.sets } : {}), ...(r.reps !== null ? { reps: r.reps } : {}),
        };
        await fixSaved(last.id, targets, fields);
        push({ id: uid(), role: "bot", text: L("Corregido:", "Fixed:") + " " + targets.map((x) => describe({ ...x, ...fields })).join(", "),
          coach: coachAfter([r.exercise ?? targets[0].exercise]) });
        return;
      }

      if (r.intent === "start") {
        setActive(r.exercise);
        const it = gym.planItem(r.exercise);
        const s = gym.statsFor(r.exercise);
        const goal = it ? gym.verdictFor(it).goal : null;
        push({ id: uid(), role: "bot", text: [
          L(`Va ${r.exercise}. Dime las series: «8 con 70», «7»…`, `${r.exercise} it is. Tell me the sets: "8 con 70", "7"…`),
          goal ? `${L("Meta", "Goal")}: ${L(goal.es, goal.en)}.` : "",
          s?.last ? `${L("Última", "Last")}: ${describe(s.last)} · ${L("récord", "best")} ${gym.w(s.best)}.` : "",
        ].filter(Boolean).join(" ") });
        return;
      }

      if (r.intent === "query") {
        if (!r.exercise) { push({ id: uid(), role: "bot", text: L("¿De qué ejercicio? Ej.: «récord en sentadilla».", "Which exercise? e.g. \"pr squat\".") }); return; }
        const s = gym.statsFor(r.exercise);
        if (!s) { push({ id: uid(), role: "bot", text: L(`Aún no tienes registros de ${r.exercise}.`, `No ${r.exercise} entries yet.`) }); return; }
        const lastDate = s.last ? new Date(s.last.date).toLocaleDateString(locale, { day: "numeric", month: "short" }) : "";
        push({ id: uid(), role: "bot", text: L(
          `${r.exercise}: récord ${gym.w(s.best)} · 1RM estimado ${vol(s.best1RM)} · ${s.sessions} sesión(es). Última: ${s.last ? describe(s.last) : "—"} (${lastDate}).`,
          `${r.exercise}: best ${gym.w(s.best)} · est. 1RM ${vol(s.best1RM)} · ${s.sessions} session(s). Last: ${s.last ? describe(s.last) : "—"} (${lastDate}).`) });
        return;
      }

      if (r.intent === "convert") {
        const kg = toKgFrom(r.value, r.from);
        const out = r.to === "lb" ? kg / 0.45359237 : kg;
        const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 1 });
        const plates = r.to === "lb" ? ` · ${L("cargable", "loadable")}: ${formatKg(Math.round(out / 2.5) * 2.5)} lb` : ` · ${L("cargable", "loadable")}: ${formatKg(Math.round(out / 1.25) * 1.25)} kg`;
        push({ id: uid(), role: "bot", text: `${fmt(r.value)} ${r.from} = ${fmt(out)} ${r.to}${plates}` });
        return;
      }

      if (r.intent === "variants") {
        if (!r.exercise) {
          push({ id: uid(), role: "bot", text: L("¿Para qué ejercicio? Ej.: «alternativas a banca».", "For which exercise? e.g. \"alternatives to bench\".") });
          return;
        }
        const v = variantOptions(r.exercise);
        push({ id: uid(), role: "bot", variants: v.options.length ? v : undefined, text: v.options.length
          ? L(`Opciones para ${r.exercise} (mismo movimiento). Toca una y ajusta el peso; cuenta para tu rutina sin cambiar el peso de ${r.exercise}. El peso es orientativo: empieza ahí y deja 2 reps en reserva.`,
              `Options for ${r.exercise} (same movement). Tap one and adjust the weight; it counts for your routine without changing ${r.exercise}'s weight. Weights are a rough start: leave 2 reps in reserve.`)
          : L(`No tengo alternativas guardadas para ${r.exercise}.`, `I have no alternatives saved for ${r.exercise}.`) });
        return;
      }

      if (r.intent === "done") {
        gym.toggleDone(r.exercise, true);
        const it = gym.planItem(r.exercise);
        if (!it) { push({ id: uid(), role: "bot", text: L(`✓ ${r.exercise} marcado como hecho.`, `✓ ${r.exercise} marked done.`) }); return; }
        const v = gym.verdictFor(it);
        const n = v.session?.day === todayKey() ? v.session.reps.length : 0;
        if (v.kind === "incomplete" || n === 0) {
          push({ id: uid(), role: "bot", text: L(
            `✓ ${it.exercise} marcado como hecho (${n}/${it.sets} series). Sin todas las series no cuenta para subir: la próxima vez, mismo peso.`,
            `✓ ${it.exercise} marked done (${n}/${it.sets} sets). Without every set it doesn't count toward progress: same weight next time.`) });
          return;
        }
        push({ id: uid(), role: "bot", text: L(`✓ ${it.exercise} hecho.`, `✓ ${it.exercise} done.`), coach: [coachLine(it, v, gym.applyVerdict(it, v))] });
        return;
      }

      if (r.intent === "finish") {
        gym.setCompleted(true);
        push({ id: uid(), role: "bot", text: L("¡Rutina completa! Buen trabajo.", "Workout complete! Nice work."), summary: summary() });
        return;
      }

      // intent: log
      if (r.unknownName && r.variantOf && r.entries.length + r.incomplete.length) {
        const orig = gym.exercises.find((e) => e.name === r.variantOf) ?? findInLibrary(r.variantOf);
        if (orig) {
          await gym.addExercise.mutateAsync({ name: r.unknownName, muscleGroup: orig.muscleGroup as MuscleGroup, pattern: orig.pattern as MovementPattern, aliases: [], bodyweight: false });
          push({ id: uid(), role: "bot", text: L(`Añadí «${r.unknownName}» a tu catálogo como variante de ${r.variantOf}.`, `Added "${r.unknownName}" to your catalog as a ${r.variantOf} variant.`) });
          r.unknownName = null;
        }
      }
      if (r.unknownName && r.entries.length + r.incomplete.length) {
        push({ id: uid(), role: "bot",
          text: L(`«${r.unknownName}» no está en tu catálogo. Si es uno de estos, tócalo y lo recordaré; si es nuevo, dime el grupo muscular.`,
                  `"${r.unknownName}" isn't in your catalog. If it's one of these, tap it and I'll remember; if it's new, pick the muscle group.`),
          unknown: { name: r.unknownName, entries: r.entries, dayOffset: r.dayOffset, suggestions: suggestExercises(r.unknownName, cat) } });
        return;
      }

      const replies: Msg[] = [];
      const added = await adopted([...r.entries, ...r.incomplete]);
      if (added.length) {
        replies.push({ id: uid(), role: "bot", text: L(`Añadí a tu catálogo: ${added.join(", ")}.`, `Added to your catalog: ${added.join(", ")}.`) });
      }
      if (r.entries.length) {
        const saved = await save(r.entries, r.dayOffset);
        const when = r.dayOffset === -1 ? L(" (ayer)", " (yesterday)") : r.dayOffset === -2 ? L(" (anteayer)", " (2 days ago)") : "";
        const coach = coachAfter(saved.filter((x) => !x.variantOf).map((x) => x.exercise));
        replies.push({ id: uid(), role: "bot", text: L(`Registrado${when}:`, `Logged${when}:`), saved, dayOffset: r.dayOffset, coach, notes: variantNotes(saved) });
      }
      if (r.incomplete.length) {
        setActive(r.incomplete[0].exercise); // la respuesta («80 3x10») va a este ejercicio
        replies.push({ id: uid(), role: "bot", text: L(
          `Me falta info para ${r.incomplete.map(describe).join(", ")}. Dime series×reps y peso, p. ej. «${r.incomplete[0].exercise.toLowerCase()} 80 3x10».`,
          `Missing info for ${r.incomplete.map(describe).join(", ")}. Give me sets×reps and weight, e.g. "${r.incomplete[0].exercise.toLowerCase()} 80 3x10".`) });
      }
      if (!replies.length) {
        replies.push({ id: uid(), role: "bot", text: L(
          "No lo entendí. Prueba con «press banca 80kg 3x10» o escribe «ayuda».",
          "I didn't get that. Try \"press banca 80kg 3x10\" or type \"help\".") });
      }
      push(...replies);
    } catch (err) {
      setText((t) => t || input); // no se pierde lo escrito
      push({ id: uid(), role: "bot", text: /^401/.test((err as Error)?.message ?? "")
        ? L("Tu sesión caducó: vuelve a iniciar sesión y envíalo otra vez.", "Your session expired: sign in and send it again.")
        : L("No pude guardarlo (fallo de conexión o del servidor). Te dejé el texto para reintentar.", "Couldn't save it (connection or server error). Your text is still there to retry.") });
    }
  }

  async function undo(msgId: string, saved: Saved[], coach?: Coach[]) {
    await gym.deleteLogs.mutateAsync(saved.map((s) => s.id));
    // Si esa sesión había cambiado el peso de la rutina, se revierte también
    coach?.forEach((c) => { if (c.change && !c.reverted) gym.revertChange(c.change); });
    patch(msgId, (m) => ({ ...m, undone: true, coach: (m as BotMsg).coach?.map((c) => ({ ...c, reverted: c.reverted || !!c.change })) }) as Msg);
  }

  /** Rehacer un registro deshecho: vuelve con su fecha original y se recalcula el entrenador */
  async function redo(m: BotMsg) {
    const rows = gym.trashedLogs(m.saved!.map((x) => x.id));
    if (!rows.length) { push({ id: uid(), role: "bot", text: L("Ese registro ya no está guardado para restaurar.", "That entry can no longer be restored.") }); return; }
    const back = await gym.restoreLogs.mutateAsync(rows);
    patch(m.id, (x) => ({
      ...x, undone: false, saved: m.saved!.filter((y) => back.some((b) => b.id === y.id)),
      coach: coachAfter(back.filter((b) => !b.variantOf).map((b) => b.exercise)),
    }) as Msg);
  }

  async function fixSaved(msgId: string, rows: Saved[], fields: Partial<LogFields>) {
    // Si el registro mal puesto había cambiado el peso de su rutina, se revierte
    const m = msgs.find((x) => x.id === msgId) as BotMsg | undefined;
    m?.coach?.forEach((c, i) => { if (c.change && !c.reverted && rows.some((x) => sameExercise(x.exercise, c.exercise))) revertCoach(msgId, i); });
    for (const x of rows) {
      const variant = fields.exercise && x.variantOf && sameExercise(fields.exercise, x.variantOf) ? { variantOf: null } : {};
      const row = await gym.updateLog.mutateAsync({ id: x.id, ...fields, ...variant });
      patch(msgId, (mm) => ({ ...mm, saved: (mm as BotMsg).saved!.map((y) => (y.id === row.id
        ? { ...y, exercise: row.exercise, weight: row.weight, sets: row.sets, reps: row.reps, variantOf: row.variantOf, assumed: [], pr: y.pr && !fields.exercise && fields.weight === undefined } : y)) }) as Msg);
    }
  }

  /** Acciones de botones: avisa si fallan en vez de quedarse en silencio */
  const attempt = async (fn: () => Promise<unknown>) => {
    if (sending.current) return;
    sending.current = true;
    try { await fn(); } catch {
      push({ id: uid(), role: "bot", text: L("No se pudo hacer el cambio. Inténtalo de nuevo.", "Couldn't apply the change. Try again.") });
    } finally { sending.current = false; }
  };

  function revertCoach(msgId: string, idx: number) {
    const m = msgs.find((x) => x.id === msgId) as BotMsg | undefined;
    const c = m?.coach?.[idx];
    if (!c?.change || c.reverted) return;
    gym.revertChange(c.change);
    patch(msgId, (x) => ({ ...x, coach: (x as BotMsg).coach!.map((cc, i) => (i === idx ? { ...cc, reverted: true } : cc)) }) as Msg);
  }

  async function resolveUnknown(msg: Extract<Msg, { role: "bot" }>, group: MuscleGroup) {
    const u = msg.unknown!;
    try {
      await gym.addExercise.mutateAsync({ name: u.name, muscleGroup: group, pattern: DEFAULT_PATTERN[group], aliases: [], bodyweight: false });
      patch(msg.id, (m) => ({ ...m, unknown: { ...u, resolved: true } }) as Msg);
      if (u.entries.length) {
        const saved = await save(u.entries, u.dayOffset);
        push({ id: uid(), role: "bot", text: L(`Añadido a ${MUSCLE_LABELS[group].es} y registrado:`, `Added to ${MUSCLE_LABELS[group].en} and logged:`), saved, coach: coachAfter(saved.filter((x) => !x.variantOf).map((x) => x.exercise)), notes: variantNotes(saved) });
      } else {
        push({ id: uid(), role: "bot", text: L(`Añadí «${u.name}». Ahora dime series×reps y peso.`, `Added "${u.name}". Now tell me sets×reps and weight.`) });
      }
    } catch {
      push({ id: uid(), role: "bot", text: L("No pude añadir el ejercicio.", "Couldn't add the exercise.") });
    }
  }

  /** El nombre desconocido era uno existente: se registra ahí y se recuerda ese nombre */
  async function resolveAs(msg: BotMsg, name: string) {
    const u = msg.unknown!;
    const entries = u.entries.map((e) => ({ ...e, exercise: name }));
    await adopted([{ exercise: name, weight: null, sets: null, reps: null, assumed: [] }]);
    const own = (queryClient.getQueryData<GymExercise[]>(EXERCISES_KEY) ?? gym.exercises).find((e) => sameExercise(e.name, name));
    const alias = u.name.toLowerCase();
    if (own && alias.length >= 2 && alias.length <= 40) await gym.addAlias.mutateAsync({ id: own.id, alias }).catch(() => undefined);
    patch(msg.id, (m) => ({ ...m, unknown: { ...u, resolved: true } }) as Msg);
    if (!entries.length) {
      setActive(name);
      push({ id: uid(), role: "bot", text: L(`Anotado: «${u.name}» es ${name}. Dime series×reps y peso.`, `Got it: "${u.name}" is ${name}. Tell me sets×reps and weight.`) });
      return;
    }
    const saved = await save(entries, u.dayOffset);
    push({ id: uid(), role: "bot", text: L(`Registrado. Recordaré que «${u.name}» es ${name}:`, `Logged. I'll remember "${u.name}" is ${name}:`), saved, dayOffset: u.dayOffset,
      coach: coachAfter(saved.filter((x) => !x.variantOf).map((x) => x.exercise)), notes: variantNotes(saved) });
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void handle(text); };
  const busy = gym.logBatch.isPending || gym.deleteLogs.isPending || gym.restoreLogs.isPending || gym.updateLog.isPending;
  const current = currentExercise();
  const patternOf = gym.pattern;
  const aliveIds = new Set(gym.logs.map((l) => l.id));

  return (
    <div className="flex h-[560px] flex-col border border-rock/70 bg-background">
      <div className="flex items-center justify-between border-b border-rock/70 px-4 py-3">
        <p className="label-mono flex items-center gap-2"><span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" />{L("Bitácora · chat", "Log · chat")}</p>
        <div className="flex items-center gap-3">
          <UnitSwitch unit={gym.unit} onChange={gym.setUnit} />
          {msgs.length > 0 && (
            <button className="label-mono text-muted-foreground transition-colors hover:text-foreground" onClick={() => setMsgs([])}>
              {L("Limpiar", "Clear")}
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4">
        {!msgs.length && (
          <div className="flex h-full flex-col items-start justify-end gap-3 text-sm text-muted-foreground">
            <p className="max-w-sm">{L("Cuéntame qué entrenaste, como se lo dirías a un compañero. Lo anoto yo.", "Tell me what you trained, like you'd tell a gym buddy. I'll log it.")}</p>
            <p className="label-mono">{L("Ej.: «banca 80kg 3x10 y dominadas 4x8»", "e.g. \"bench 80kg 3x10 and pull ups 4x8\"")}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "user" ? (
                <div className="max-w-[80%] break-words rounded-2xl rounded-br-sm bg-foreground px-4 py-2 text-sm text-background">{m.text}</div>
              ) : (
                <div className={cn("min-w-0 max-w-[90%] space-y-3 break-words rounded-2xl rounded-bl-sm border border-rock/70 px-4 py-3 text-sm", m.undone && "opacity-70")}>
                  <p>{m.text}</p>

                  {m.saved && (
                    <ul className="space-y-1.5">
                      {m.saved.map((s, i) => (
                        <motion.li
                          key={s.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i }}
                          className={cn("flex flex-wrap items-baseline gap-x-2 font-mono text-xs", m.undone && "line-through")}
                        >
                          <span className="font-semibold text-foreground">{s.exercise}</span>
                          <span className="text-muted-foreground">{s.sets}×{s.reps}</span>
                          <span>{s.weight ? gym.w(s.weight) : L("peso corporal", "bodyweight")}</span>
                          {s.weight > 0 && s.reps > 1 && <span className="text-muted-foreground">· 1RM≈{Math.round(fromKg(estimate1RM(s.weight, s.reps), gym.unit))}</span>}
                          {s.variantOf && <span className="text-[10px] text-muted-foreground">↔ {s.variantOf}</span>}
                          {s.pr && !m.undone && (
                            <motion.span
                              initial={{ scale: 0.4, opacity: 0 }}
                              animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                              transition={{ duration: 0.6, delay: 0.2 + 0.08 * i }}
                              className="rounded-full bg-signal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                            >
                              {L("Nuevo récord", "New PR")}
                            </motion.span>
                          )}
                          {s.assumed.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              ({s.assumed.includes("weight") ? L("peso", "weight") : ""}{s.assumed.length === 2 ? " + " : ""}{s.assumed.includes("setsreps") ? L("series", "sets") : ""} {L("supuesto", "assumed")})
                            </span>
                          )}
                          {!m.undone && aliveIds.has(s.id) && editing !== s.id && (
                            <button onClick={() => setEditing(s.id)} className="ml-auto self-center p-1 text-muted-foreground transition-colors hover:text-signal" aria-label={L(`Corregir ${s.exercise}`, `Fix ${s.exercise}`)}>
                              <Pencil className="h-3 w-3" />
                            </button>
                          )}
                          {editing === s.id && !m.undone && (
                            <LogEditor gym={gym} value={s} onCancel={() => setEditing(null)}
                              onSave={(f) => attempt(async () => {
                                await fixSaved(m.id, [s], f);
                                setEditing(null);
                                const c = coachAfter([f.exercise]);
                                if (c.length) push({ id: uid(), role: "bot", text: L("Corregido.", "Fixed."), coach: c });
                              })} />
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {m.saved && !m.undone && (() => {
                    const heavy = [...m.saved].filter((s) => BARBELL.has(patternOf(s.exercise) ?? "") && s.weight >= 20).sort((a, b) => b.weight - a.weight)[0];
                    return heavy ? <div className="border-t border-rock/50 pt-3"><Barbell weight={heavy.weight} /></div> : null;
                  })()}

                  {m.saved && (
                    <div className="flex items-center justify-between gap-3 border-t border-rock/50 pt-2">
                      <span className="label-mono text-muted-foreground">
                        {L("Volumen", "Volume")} {vol(m.saved.reduce((a, s) => a + s.weight * s.sets * s.reps, 0))}
                      </span>
                      {!m.undone ? (
                        <button
                          className="label-mono inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-signal"
                          onClick={() => attempt(() => undo(m.id, m.saved!, m.coach))}
                          disabled={busy}
                        >
                          <Undo2 className="h-3 w-3" /> {L("Deshacer", "Undo")}
                        </button>
                      ) : (
                        <button
                          className="label-mono inline-flex items-center gap-1 text-foreground transition-colors hover:text-signal"
                          onClick={() => attempt(() => redo(m))}
                          disabled={busy}
                        >
                          <Redo2 className="h-3 w-3" /> {L("Rehacer", "Redo")}
                        </button>
                      )}
                    </div>
                  )}

                  {m.coach?.map((c, i) => <CoachCard key={c.exercise} c={c} dim={!!m.undone} onRevert={() => revertCoach(m.id, i)} />)}

                  {m.notes?.map((n) => <p key={n} className="border-t border-rock/50 pt-2 text-xs text-muted-foreground">{n}</p>)}

                  {m.variants && (
                    <div className="grid gap-1.5 border-t border-rock/50 pt-3">
                      {m.variants.options.map((o) => (
                        <button
                          key={o.name}
                          onClick={() => { setText(o.prefill); inputRef.current?.focus(); }}
                          className="flex items-baseline justify-between gap-3 rounded-lg border border-rock/70 px-3 py-2 text-left transition-colors hover:border-signal"
                        >
                          <span className="font-medium">{o.name}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{o.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {m.summary && <SummaryCard s={m.summary} unit={gym.unit} />}

                  {m.unknown && !m.unknown.resolved && !!m.unknown.suggestions?.length && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.unknown.suggestions.map((n) => (
                        <button key={n} onClick={() => attempt(() => resolveAs(m, n))} className="rounded-full border border-foreground px-3 py-1 text-xs font-medium transition-colors hover:border-signal hover:text-signal">
                          {n}
                        </button>
                      ))}
                      <span className="label-mono basis-full pt-1 text-muted-foreground">{L("o es nuevo, de:", "or it's new, for:")}</span>
                    </div>
                  )}
                  {m.unknown && !m.unknown.resolved && (
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_GROUPS.map((g) => (
                        <button
                          key={g}
                          onClick={() => attempt(() => resolveUnknown(m, g))}
                          className="label-mono rounded-full border border-rock px-3 py-1 transition-colors hover:border-signal hover:text-signal"
                        >
                          {L(MUSCLE_LABELS[g].es, MUSCLE_LABELS[g].en)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-rock/70 p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {[L("ayuda", "help"), L("deshacer", "undo"), ...(gym.trashed.length ? [L("rehacer", "redo")] : []), ...(current ? [L("máquina ocupada", "machine busy")] : []), L("terminé la rutina", "finished workout"), L("135 lb a kg", "135 lb to kg")].map((chip) => (
            <button key={chip} onClick={() => handle(chip)} className="label-mono shrink-0 rounded-full border border-rock/70 px-3 py-1 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              {chip}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={current
              ? L(`${current}: «segunda serie 8», «listo»…`, `${current}: "second set 8", "done"…`)
              : L("dominadas primera serie 10, banca 60 3x10…", "pull ups first set 10, bench 60 3x10…")}
            className="h-11 min-w-0 flex-1 rounded-full border border-rock bg-transparent px-4 text-sm outline-none transition-colors focus:border-foreground"
            aria-label={L("Mensaje", "Message")}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!text.trim() || busy}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-white transition-opacity disabled:opacity-40"
            aria-label={L("Enviar", "Send")}
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

const KIND: Record<Verdict["kind"], { icon: typeof ArrowUp; es: string; en: string; tone: string }> = {
  up: { icon: ArrowUp, es: "Sube", en: "Go up", tone: "bg-signal text-white" },
  reps: { icon: Plus, es: "Suma reps", en: "Add reps", tone: "bg-foreground text-background" },
  hold: { icon: Equal, es: "Mantén", en: "Hold", tone: "border border-rock text-foreground" },
  deload: { icon: ArrowDown, es: "Descarga", en: "Deload", tone: "border border-signal text-signal" },
  incomplete: { icon: Plus, es: "En curso", en: "In progress", tone: "border border-rock text-muted-foreground" },
  new: { icon: Plus, es: "Nuevo", en: "New", tone: "border border-rock text-muted-foreground" },
};

function CoachCard({ c, dim, onRevert }: { c: Coach; dim: boolean; onRevert: () => void }) {
  const { L } = useLang();
  const k = KIND[c.kind];
  const Icon = k.icon;
  if (c.kind === "incomplete") {
    return (
      <p className={cn("border-t border-rock/50 pt-2 font-mono text-xs text-muted-foreground", dim && "line-through")}>
        <span className="text-foreground">{c.exercise}</span> · {c.why} {c.goal}.
        {c.tip && <span className="block pt-1 text-[11px]">{c.tip}</span>}
      </p>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={cn("space-y-1.5 border-t border-rock/50 pt-3", dim && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("label-mono inline-flex items-center gap-1 rounded-full px-2 py-0.5", k.tone)}><Icon className="h-3 w-3" />{L(k.es, k.en)}</span>
        <span className="font-semibold">{c.exercise}</span>
      </div>
      <p className="text-muted-foreground">{c.why}</p>
      <p className="font-mono text-xs"><span className="text-muted-foreground">{L("Próxima", "Next")}:</span> {c.goal}</p>
      {c.tip && <p className="text-xs text-muted-foreground">{c.tip}</p>}
      {c.change && (
        <div className="flex items-center justify-between gap-2 font-mono text-xs">
          <span className={cn(c.reverted && "line-through opacity-60")}>
            {L("Rutina actualizada", "Routine updated")}: {c.change.from === null ? "—" : formatKg(c.change.from)} → {c.change.to === null ? "—" : formatKg(c.change.to)} {c.change.unit}
          </span>
          {!c.reverted && !dim && (
            <button onClick={onRevert} className="label-mono inline-flex shrink-0 items-center gap-1 text-muted-foreground transition-colors hover:text-signal">
              <Undo2 className="h-3 w-3" /> {L("Mantener peso", "Keep weight")}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function SummaryCard({ s, unit }: { s: Summary; unit: Unit }) {
  const { L, locale } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: easeOutExpo }}
      className="space-y-2 border-t border-rock/50 pt-3"
    >
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, delay: 0.1 }}
          className="grid h-6 w-6 place-items-center rounded-full bg-signal text-white"
        ><Check className="h-3.5 w-3.5" /></motion.span>
        <span className="font-semibold">{s.title}</span>
        {s.total > 0 && <span className="label-mono text-signal">{s.done}/{s.total}</span>}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        {s.sets} {L("series", "sets")} · {Math.round(fromKg(s.volume, unit)).toLocaleString(locale)} {unit} {L("de volumen", "volume")}
      </p>
      {s.changes.length > 0 && (
        <p className="font-mono text-xs"><span className="text-muted-foreground">{L("Próxima vez", "Next time")}:</span> {s.changes.join(" · ")}</p>
      )}
      {s.pending.length > 0 && (
        <p className="text-xs text-muted-foreground">{L("Quedó sin hacer", "Skipped")}: {s.pending.join(", ")}</p>
      )}
    </motion.div>
  );
}

/** Interruptor kg / lb: cambia lo que se muestra, los números sin unidad y los pesos de la rutina */
export function UnitSwitch({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  const { L } = useLang();
  return (
    <div role="radiogroup" aria-label={L("Unidad de peso", "Weight unit")} className="relative flex rounded-full border border-rock/70 p-0.5">
      {(["kg", "lb"] as const).map((u) => (
        <button
          key={u}
          role="radio"
          aria-checked={unit === u}
          onClick={() => onChange(u)}
          title={u === unit ? undefined : L(`Cambiar todo a ${u} (también tu rutina)`, `Switch everything to ${u} (routine too)`)}
          className={cn("label-mono relative z-10 rounded-full px-2.5 py-0.5 transition-colors", unit === u ? "text-background" : "text-muted-foreground hover:text-foreground")}
        >
          {unit === u && <motion.span layoutId="unit-pill" className="absolute inset-0 -z-10 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
          {u}
        </button>
      ))}
    </div>
  );
}
