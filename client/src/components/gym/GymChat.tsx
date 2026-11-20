import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Equal, Plus, Undo2 } from "lucide-react";
import type { GymLog } from "@shared/schema";
import {
  EXERCISE_LIBRARY, MUSCLE_GROUPS, MUSCLE_LABELS, estimate1RM, formatKg, isoDow, parseWorkoutMessage, planWeightKg, todayKey,
  type HistoryItem, type MovementPattern, type MuscleGroup, type ParsedEntry, type Verdict,
} from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import Barbell from "./Barbell";
import type { GymApi, PlanChange } from "./useGym";

// Chat de registro: el usuario escribe como hablaría ("banca 80 3x10 y sentadilla 100 5x5"),
// shared/gym.ts lo interpreta en local (sin IA externa) y se guarda al instante con opción de deshacer.

type Saved = { id: string; exercise: string; weight: number; sets: number; reps: number; pr: boolean; assumed: ParsedEntry["assumed"] };
/** Respuesta del entrenador tras registrar: progreso de la sesión o veredicto con el cambio de peso */
type Coach = {
  exercise: string; kind: Verdict["kind"]; goal: string; why: string; tip?: string;
  change?: PlanChange & { unit: string }; reverted?: boolean;
};
type Summary = { title: string; done: number; total: number; sets: number; volume: number; pending: string[]; changes: string[] };
type BotMsg = Extract<Msg, { role: "bot" }>;
type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; text: string; saved?: Saved[]; dayOffset?: number; undone?: boolean; coach?: Coach[]; summary?: Summary;
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
  // Los ejercicios de la rutina de hoy van primero: ganan los empates ("remo listo" → el remo de tu rutina)
  const catalog = () => {
    const today = new Set((gym.plan?.days.find((d) => d.dow === isoDow())?.items ?? []).map((i) => i.exercise));
    return [
      ...[...gym.exercises].sort((a, b) => +today.has(b.name) - +today.has(a.name))
        .map((e) => ({ name: e.name, aliases: e.aliases, bodyweight: e.bodyweight })),
      ...EXERCISE_LIBRARY.filter((e) => !mine().has(e.name)).map((e) => ({ name: e.name, aliases: e.aliases, bodyweight: !!e.bodyweight })),
    ];
  };
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

  /** Ejercicio en curso: el último registrado hoy, si no se marcó como terminado */
  const currentExercise = () => {
    const last = gym.freshLogs().find((l) => todayKey(new Date(l.date)) === todayKey());
    if (!last || gym.dayRow()?.done.includes(last.exercise)) return null;
    return last.exercise;
  };

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
    const r = parseWorkoutMessage(input, catalog(), [...gym.freshLogs(), ...fromPlan], currentExercise());

    try {
      if (r.intent === "help") {
        push({ id: uid(), role: "bot", text: L(
          "Escríbeme como lo dirías: «banca 80kg 3x10», «sentadilla 100 5x5 y peso muerto 140x3», «banca 60x10, 70x8, 80x6» (una serie por peso), «ayer dominadas 4x8», «militar 3 series de 8 con 42,5kg». Serie a serie: «dominadas primera serie 10», luego «segunda serie 8», «7»… (sigo con el mismo ejercicio). Al completar las series te digo si toca subir, mantener o descargar, y ajusto tu rutina. «remo listo» marca un ejercicio; «terminé» cierra la rutina del día. También: «récord en banca» o «deshacer».",
          "Write it like you'd say it: \"bench 80kg 3x10\", \"squat 100 5x5 and deadlift 140x3\", \"bench 60x10, 70x8, 80x6\" (one set per weight), \"ayer pull ups 4x8\". If you skip the weight or sets I reuse your last session. Set by set: \"pull ups first set 10\", then \"second set 8\", \"7\"… When all sets are in I tell you whether to go up, hold or deload, and update your routine. \"row done\" ticks an exercise; \"finished\" closes the day. Also: \"pr bench\" or \"undo\".") });
        return;
      }

      if (r.intent === "undo") {
        const last = [...msgs].reverse().find((m): m is Extract<Msg, { role: "bot" }> => m.role === "bot" && !!m.saved?.length && !m.undone);
        if (!last?.saved) { push({ id: uid(), role: "bot", text: L("No hay nada reciente que deshacer.", "Nothing recent to undo.") }); return; }
        await undo(last.id, last.saved, last.coach);
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
        const coach = coachAfter(saved.map((x) => x.exercise));
        replies.push({ id: uid(), role: "bot", text: L(`Registrado${when}:`, `Logged${when}:`), saved, dayOffset: r.dayOffset, coach });
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

  async function undo(msgId: string, saved: Saved[], coach?: Coach[]) {
    await gym.deleteLogs.mutateAsync(saved.map((s) => s.id));
    // Si esa sesión había cambiado el peso de la rutina, se revierte también
    coach?.forEach((c) => { if (c.change && !c.reverted) gym.revertChange(c.change); });
    patch(msgId, (m) => ({ ...m, undone: true, coach: (m as BotMsg).coach?.map((c) => ({ ...c, reverted: c.reverted || !!c.change })) }) as Msg);
  }

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
        push({ id: uid(), role: "bot", text: L(`Añadido a ${MUSCLE_LABELS[group].es} y registrado:`, `Added to ${MUSCLE_LABELS[group].en} and logged:`), saved, coach: coachAfter(saved.map((x) => x.exercise)) });
      } else {
        push({ id: uid(), role: "bot", text: L(`Añadí «${u.name}». Ahora dime series×reps y peso.`, `Added "${u.name}". Now tell me sets×reps and weight.`) });
      }
    } catch {
      push({ id: uid(), role: "bot", text: L("No pude añadir el ejercicio.", "Couldn't add the exercise.") });
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); void handle(text); };
  const busy = gym.logBatch.isPending || gym.deleteLogs.isPending;
  const current = currentExercise();
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
                          onClick={() => undo(m.id, m.saved!, m.coach)}
                          disabled={busy}
                        >
                          <Undo2 className="h-3 w-3" /> {L("Deshacer", "Undo")}
                        </button>
                      ) : <span className="label-mono text-muted-foreground">{L("Deshecho", "Undone")}</span>}
                    </div>
                  )}

                  {m.coach?.map((c, i) => <CoachCard key={c.exercise} c={c} dim={!!m.undone} onRevert={() => revertCoach(m.id, i)} />)}

                  {m.summary && <SummaryCard s={m.summary} />}

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
          {[L("ayuda", "help"), L("deshacer", "undo"), L("terminé la rutina", "finished workout"), L("récord en banca", "pr bench")].map((chip) => (
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

function SummaryCard({ s }: { s: Summary }) {
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
        {s.sets} {L("series", "sets")} · {s.volume.toLocaleString(locale)} kg {L("de volumen", "volume")}
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
