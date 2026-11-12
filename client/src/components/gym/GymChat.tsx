import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Undo2 } from "lucide-react";
import type { GymLog } from "@shared/schema";
import {
  EXERCISE_LIBRARY, MUSCLE_GROUPS, MUSCLE_LABELS, estimate1RM, formatKg, parseWorkoutMessage, planWeightKg, type HistoryItem,
  type MovementPattern, type MuscleGroup, type ParsedEntry,
} from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import Barbell from "./Barbell";
import type { GymApi } from "./useGym";

// Chat de registro: el usuario escribe como hablaría ("banca 80 3x10 y sentadilla 100 5x5"),
// shared/gym.ts lo interpreta en local (sin IA externa) y se guarda al instante con opción de deshacer.

type Saved = { id: string; exercise: string; weight: number; sets: number; reps: number; pr: boolean; assumed: ParsedEntry["assumed"] };
type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; text: string; saved?: Saved[]; dayOffset?: number; undone?: boolean;
      /** Ejercicio desconocido pendiente de añadir al catálogo */
      unknown?: { name: string; entries: ParsedEntry[]; dayOffset: number; resolved?: boolean } };

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
  const mine = () => new Set(gym.exercises.map((e) => e.name));
  const catalog = () => [
    ...gym.exercises.map((e) => ({ name: e.name, aliases: e.aliases, bodyweight: e.bodyweight })),
    ...EXERCISE_LIBRARY.filter((e) => !mine().has(e.name)).map((e) => ({ name: e.name, aliases: e.aliases, bodyweight: !!e.bodyweight })),
  ];
  const adopted = async (entries: ParsedEntry[]) => {
    const have = mine();
    const missing = Array.from(new Set(entries.map((e) => e.exercise).filter((n) => !have.has(n))));
    const added: string[] = [];
    for (const n of missing) {
      const def = EXERCISE_LIBRARY.find((e) => e.name === n);
      if (def) { await gym.addExercise.mutateAsync({ ...def, bodyweight: !!def.bodyweight }); added.push(n); }
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
      entries: entries.map((e) => ({ exercise: e.exercise, weight: e.weight!, sets: e.sets!, reps: e.reps! })),
    });
    return rows.map((r, i) => {
      const best = prevBest.get(r.exercise) ?? 0;
      const pr = r.weight > 0 && r.weight > best && (gym.statsFor(r.exercise)?.sessions ?? 0) > 0;
      if (pr) prevBest.set(r.exercise, r.weight);
      return { id: r.id, exercise: r.exercise, weight: r.weight, sets: r.sets, reps: r.reps, pr, assumed: entries[i]?.assumed ?? [] };
    });
  }

  const describe = (e: { exercise: string; weight: number | null; sets: number | null; reps: number | null }) =>
    `${e.exercise} ${e.sets ?? "?"}×${e.reps ?? "?"}${e.weight ? ` @ ${formatKg(e.weight)} kg` : ""}`;

  async function handle(raw: string) {
    const input = raw.trim();
    if (!input) return;
    push({ id: uid(), role: "user", text: input });
    setText("");
    // Si falta peso/series y no hay historial, se usa el objetivo de la rutina (fecha 0 = más antiguo que cualquier registro)
    const fromPlan: HistoryItem[] = (gym.plan?.days ?? []).flatMap((d) => d.items)
      .filter((i) => i.reps !== "max" && i.weight !== null)
      .map((i) => ({ exercise: i.exercise, weight: planWeightKg(i)!, sets: i.sets, reps: (i.reps as [number, number])[0], date: new Date(0) }));
    const r = parseWorkoutMessage(input, catalog(), [...gym.logs, ...fromPlan]);

    try {
      if (r.intent === "help") {
        push({ id: uid(), role: "bot", text: L(
          "Escríbeme como lo dirías: «banca 80kg 3x10», «sentadilla 100 5x5 y peso muerto 140x3», «banca 60x10, 70x8, 80x6» (una serie por peso), «ayer dominadas 4x8», «militar 3 series de 8 con 42,5kg». Si omites el peso o las series, uso los de tu última sesión. También: «récord en banca» o «deshacer».",
          "Write it like you'd say it: \"bench 80kg 3x10\", \"squat 100 5x5 and deadlift 140x3\", \"bench 60x10, 70x8, 80x6\" (one set per weight), \"ayer pull ups 4x8\". If you skip the weight or sets I reuse your last session. Also: \"pr bench\" or \"undo\".") });
        return;
      }

      if (r.intent === "undo") {
        const last = [...msgs].reverse().find((m): m is Extract<Msg, { role: "bot" }> => m.role === "bot" && !!m.saved?.length && !m.undone);
        if (!last?.saved) { push({ id: uid(), role: "bot", text: L("No hay nada reciente que deshacer.", "Nothing recent to undo.") }); return; }
        await undo(last.id, last.saved);
        push({ id: uid(), role: "bot", text: L(`Listo, borré ${last.saved.length} registro(s).`, `Done, removed ${last.saved.length} entr${last.saved.length === 1 ? "y" : "ies"}.`) });
        return;
      }

      if (r.intent === "query") {
        if (!r.exercise) { push({ id: uid(), role: "bot", text: L("¿De qué ejercicio? Ej.: «récord en sentadilla».", "Which exercise? e.g. \"pr squat\".") }); return; }
        const s = gym.statsFor(r.exercise);
        if (!s) { push({ id: uid(), role: "bot", text: L(`Aún no tienes registros de ${r.exercise}.`, `No ${r.exercise} entries yet.`) }); return; }
        const lastDate = s.last ? new Date(s.last.date).toLocaleDateString(locale, { day: "numeric", month: "short" }) : "";
        push({ id: uid(), role: "bot", text: L(
          `${r.exercise}: récord ${formatKg(s.best)} kg · 1RM estimado ${Math.round(s.best1RM)} kg · ${s.sessions} sesión(es). Última: ${s.last ? describe(s.last) : "—"} (${lastDate}).`,
          `${r.exercise}: best ${formatKg(s.best)} kg · est. 1RM ${Math.round(s.best1RM)} kg · ${s.sessions} session(s). Last: ${s.last ? describe(s.last) : "—"} (${lastDate}).`) });
        return;
      }

      // intent: log
      if (r.unknownName && r.entries.length + r.incomplete.length) {
        push({ id: uid(), role: "bot",
          text: L(`«${r.unknownName}» no está en tu catálogo. ¿De qué grupo muscular es? Lo añado y lo registro.`,
                  `"${r.unknownName}" isn't in your catalog. Which muscle group? I'll add it and log it.`),
          unknown: { name: r.unknownName, entries: r.entries, dayOffset: r.dayOffset } });
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
        replies.push({ id: uid(), role: "bot", text: L(`Registrado${when}:`, `Logged${when}:`), saved, dayOffset: r.dayOffset });
      }
      if (r.incomplete.length) {
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
      push({ id: uid(), role: "bot", text: L("No pude guardarlo. ¿Sigues con la sesión iniciada?", "Couldn't save it. Are you still signed in?") });
    }
  }

  async function undo(msgId: string, saved: Saved[]) {
    await gym.deleteLogs.mutateAsync(saved.map((s) => s.id));
    patch(msgId, (m) => ({ ...m, undone: true }) as Msg);
  }

  async function resolveUnknown(msg: Extract<Msg, { role: "bot" }>, group: MuscleGroup) {
    const u = msg.unknown!;
    try {
      await gym.addExercise.mutateAsync({ name: u.name, muscleGroup: group, pattern: DEFAULT_PATTERN[group], aliases: [], bodyweight: false });
      patch(msg.id, (m) => ({ ...m, unknown: { ...u, resolved: true } }) as Msg);
      if (u.entries.length) {
        const saved = await save(u.entries, u.dayOffset);
        push({ id: uid(), role: "bot", text: L(`Añadido a ${MUSCLE_LABELS[group].es} y registrado:`, `Added to ${MUSCLE_LABELS[group].en} and logged:`), saved });
      } else {
        push({ id: uid(), role: "bot", text: L(`Añadí «${u.name}». Ahora dime series×reps y peso.`, `Added "${u.name}". Now tell me sets×reps and weight.`) });
      }
    } catch {
      push({ id: uid(), role: "bot", text: L("No pude añadir el ejercicio.", "Couldn't add the exercise.") });
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void handle(text); };
  const busy = gym.logBatch.isPending || gym.deleteLogs.isPending;
  const patternOf = (name: string) => gym.exercises.find((e) => e.name === name)?.pattern;

  return (
    <div className="flex h-[560px] flex-col border border-rock/70 bg-background">
      <div className="flex items-center justify-between border-b border-rock/70 px-4 py-3">
        <p className="label-mono flex items-center gap-2"><span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" />{L("Bitácora · chat", "Log · chat")}</p>
        {msgs.length > 0 && (
          <button className="label-mono text-muted-foreground transition-colors hover:text-foreground" onClick={() => setMsgs([])}>
            {L("Limpiar", "Clear")}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2 text-sm text-background">{m.text}</div>
              ) : (
                <div className={cn("max-w-[90%] space-y-3 rounded-2xl rounded-bl-sm border border-rock/70 px-4 py-3 text-sm", m.undone && "opacity-50")}>
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
                          <span>{s.weight ? `${formatKg(s.weight)} kg` : L("peso corporal", "bodyweight")}</span>
                          {s.weight > 0 && s.reps > 1 && <span className="text-muted-foreground">· 1RM≈{Math.round(estimate1RM(s.weight, s.reps))}</span>}
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
                        {L("Volumen", "Volume")} {m.saved.reduce((a, s) => a + s.weight * s.sets * s.reps, 0).toLocaleString(locale)} kg
                      </span>
                      {!m.undone ? (
                        <button
                          className="label-mono inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-signal"
                          onClick={() => undo(m.id, m.saved!)}
                          disabled={busy}
                        >
                          <Undo2 className="h-3 w-3" /> {L("Deshacer", "Undo")}
                        </button>
                      ) : <span className="label-mono text-muted-foreground">{L("Deshecho", "Undone")}</span>}
                    </div>
                  )}

                  {m.unknown && !m.unknown.resolved && (
                    <div className="flex flex-wrap gap-1.5">
                      {MUSCLE_GROUPS.map((g) => (
                        <button
                          key={g}
                          onClick={() => resolveUnknown(m, g)}
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
          {[L("ayuda", "help"), L("deshacer", "undo"), L("récord en banca", "pr bench")].map((chip) => (
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
            placeholder={L("banca 80kg 3x10, sentadilla 100 5x5…", "bench 80kg 3x10, squat 100 5x5…")}
            className="h-11 flex-1 rounded-full border border-rock bg-transparent px-4 text-sm outline-none transition-colors focus:border-foreground"
            aria-label={L("Mensaje", "Message")}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!text.trim() || busy}
            className="grid h-11 w-11 place-items-center rounded-full bg-signal text-white transition-opacity disabled:opacity-40"
            aria-label={L("Enviar", "Send")}
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
