import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeftRight, ArrowUp, Check, Undo2 } from "lucide-react";
import {
  EQUIPMENT_LABELS, formatKg, fromKg, isoDow, planWeightKg, repsLabel, todayKey, variantsFor, weightLabel, type PlanBlock, type PlanItem,
} from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import ExerciseFigure from "./ExerciseFigure";
import type { GymApi } from "./useGym";

export const DOW_SHORT: [string, string][] = [["L", "M"], ["M", "T"], ["X", "W"], ["J", "T"], ["V", "F"], ["S", "S"], ["D", "S"]];
export const DOW_LONG: [string, string][] = [
  ["Lunes", "Monday"], ["Martes", "Tuesday"], ["Miércoles", "Wednesday"], ["Jueves", "Thursday"],
  ["Viernes", "Friday"], ["Sábado", "Saturday"], ["Domingo", "Sunday"],
];

/** Fecha (YYYY-MM-DD) del día `dow` en la semana actual (lunes a domingo) */
export const dateOfDow = (dow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dow - isoDow(d));
  return todayKey(d);
};

/** Texto que se precarga en el chat al tocar un ejercicio del plan */
export const prefillFor = (it: PlanItem) =>
  it.reps === "max" || it.weight === null
    ? `${it.exercise.toLowerCase()} `
    : `${it.exercise.toLowerCase()} ${formatKg(it.weight)}${it.unit === "lb" ? " lb" : "kg"} ${it.sets}x`;

function Box({ on, onClick, title, locked }: { on: boolean; onClick?: () => void; title?: string; locked?: boolean }) {
  return (
    <motion.button
      whileTap={onClick && !locked ? { scale: 0.85 } : undefined}
      onClick={locked ? undefined : onClick}
      disabled={!onClick}
      title={title}
      aria-pressed={on}
      className={cn(
        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm border transition-colors",
        on ? "border-signal bg-signal text-white" : "border-rock hover:border-foreground",
        !onClick && "cursor-default opacity-40",
      )}
    >
      <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="h-3.5 w-3.5" /></motion.span>}</AnimatePresence>
    </motion.button>
  );
}

function PlanRow({ it, gym, isToday, onPick }: { it: PlanItem; gym: GymApi; isToday: boolean; onPick: (t: string) => void }) {
  const { L, es } = useLang();
  const v = gym.verdictFor(it, gym.logs);
  const pattern = gym.pattern(it.exercise) || "curl";
  const [hover, setHover] = useState(false);
  const s0 = v.session;
  // Series de hoy, contando las variantes que lo sustituyeron
  const today = isToday ? gym.todaySummary(gym.logs).items.find((i) => i.it.exercise === it.exercise) : undefined;
  const todaySets = today?.sets ?? 0;
  const variants = today?.variants ?? [];
  const [showAlt, setShowAlt] = useState(false);
  const marked = isToday && !!gym.dayRow()?.done.includes(it.exercise);
  const auto = isToday && todaySets >= it.sets;
  const done = marked || auto;
  const pending = (v.kind === "up" || v.kind === "deload") && v.next !== it.weight && !(it.progressedOn === s0?.day);
  const appliedToday = it.progressedOn === todayKey() && it.prevWeight !== undefined && it.weight !== it.prevWeight;
  const unitOf = (w: number | null | undefined) => (w === null || w === undefined ? "—" : `${formatKg(w)} ${it.unit}`);

  return (
    <motion.li
      layout
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={cn("group flex flex-wrap items-start gap-3 border-t border-rock/50 py-3 first:border-t-0", done && "opacity-70")}
    >
      <Box
        on={done}
        onClick={isToday ? () => gym.toggleDone(it.exercise) : undefined}
        locked={auto && !marked}
        title={auto && !marked ? L("Completado: registraste todas las series", "Done: every set logged") : L("Marcar como hecho", "Mark as done")}
      />
      <ExerciseFigure pattern={pattern} active={hover} className="h-11 w-11 shrink-0" />
      <button onClick={() => onPick(prefillFor(it))} className="min-w-0 flex-1 text-left" title={L("Registrar en el chat", "Log in chat")}>
        <p className={cn("truncate font-semibold leading-tight", done && "line-through decoration-rock")}>{it.exercise}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {it.sets}×{repsLabel(it)} · <span className="text-foreground">{weightLabel(it, es)}</span>
          {isToday && todaySets > 0 && <span className="ml-1 text-signal">· {Math.min(todaySets, it.sets)}/{it.sets}</span>}
        </p>
        {it.note && <p className="mt-0.5 text-xs text-muted-foreground/80">{it.note}</p>}
        {s0 && (
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {L("Última", "Last")}: {s0.reps.join("-")}{s0.weightKg ? ` @ ${gym.w(s0.weightKg)}` : ""}
          </p>
        )}
        {v.kind !== "new" && v.kind !== "incomplete" && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground" title={L(v.why.es, v.why.en)}>
            <span className="text-foreground">{L("Meta", "Goal")}:</span> {L(v.goal.es, v.goal.en)}
          </p>
        )}
        {variants.length > 0 && (
          <p className="mt-0.5 font-mono text-[11px] text-signal">↔ {L("Hoy", "Today")}: {variants.join(", ")}</p>
        )}
        {appliedToday && (
          <p className="mt-0.5 font-mono text-[11px] text-signal">{unitOf(it.prevWeight)} → {unitOf(it.weight)}</p>
        )}
      </button>
      <button
        onClick={() => setShowAlt((v) => !v)}
        aria-expanded={showAlt}
        title={L("Alternativas (otro gym, máquina ocupada…)", "Alternatives (other gym, machine busy…)")}
        className={cn("mt-0.5 shrink-0 rounded-full p-1 transition-colors", showAlt ? "text-signal" : "text-muted-foreground hover:text-foreground")}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </button>
      {pending && (
        <motion.button
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => gym.applyVerdict(it, v)}
          className={cn("label-mono inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1",
            v.kind === "up" ? "bg-signal text-white" : "border border-signal text-signal")}
          title={L(v.why.es, v.why.en)}
        >
          {v.kind === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {v.next === null ? "—" : formatKg(v.next)} {it.unit}
        </motion.button>
      )}
      <AnimatePresence>
        {showAlt && <Alternatives it={it} gym={gym} onPick={(t) => { onPick(t); setShowAlt(false); }} />}
      </AnimatePresence>
    </motion.li>
  );
}

/** Lista de variantes del mismo movimiento; al tocar una se precarga en el chat como "… en vez de X" */
function Alternatives({ it, gym, onPick }: { it: PlanItem; gym: GymApi; onPick: (t: string) => void }) {
  const { L } = useLang();
  const lastKg = gym.statsFor(it.exercise)?.last?.weight ?? planWeightKg(it);
  const opts = variantsFor(it.exercise, gym.exercises, lastKg).slice(0, 6);
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: easeOutExpo }}
      className="basis-full overflow-hidden"
    >
      {opts.length ? (
        <ul className="ml-8 mt-1 grid gap-1">
          {opts.map((o) => {
            const v = o.startKg ? fromKg(o.startKg, gym.unit) : null;
            const start = v === null ? null : `${formatKg(v >= 20 ? Math.round(v) : v)} ${gym.unit}`;
            return (
              <li key={o.name}>
                <button
                  onClick={() => onPick(`${o.name.toLowerCase()} ${start ? `${start.replace(" ", "")} ` : ""}${it.sets}x en vez de ${it.exercise.toLowerCase()}`)}
                  className="flex w-full items-baseline justify-between gap-2 rounded border border-rock/60 px-2.5 py-1.5 text-left text-xs transition-colors hover:border-signal"
                >
                  <span className="font-medium">{o.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {o.equipment ? L(EQUIPMENT_LABELS[o.equipment].es, EQUIPMENT_LABELS[o.equipment].en) : ""}
                    {start ? ` · ≈${start}${o.perHand ? L("/mano", "/hand") : ""}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ml-8 mt-1 text-xs text-muted-foreground">{L("Sin alternativas guardadas para este ejercicio.", "No alternatives saved for this exercise.")}</p>
      )}
    </motion.div>
  );
}

/** Checklist de bloques (carrera, movilidad, core). Solo se marca el día de hoy; se guarda en tu cuenta. */
function BlockChecklist({ blocks, gym, isToday }: { blocks: PlanBlock[]; gym: GymApi; isToday: boolean }) {
  const checked = isToday ? gym.dayRow()?.done ?? [] : [];
  return (
    <div className="space-y-4">
      {blocks.map((b) => (
        <div key={b.title}>
          <p className="label-mono mb-1.5 text-muted-foreground">{b.title}</p>
          <ul className="space-y-1">
            {b.lines.map((line) => {
              const id = `${b.title}/${line}`;
              const on = checked.includes(id);
              return (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <Box on={on} onClick={isToday ? () => gym.toggleDone(id) : undefined} />
                  <span className={cn("transition-colors", on && "text-muted-foreground line-through")}>{line}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Marcador general: "Rutina completa" con resumen del día */
function CompleteBar({ gym }: { gym: GymApi }) {
  const { L, locale } = useLang();
  const s = gym.todaySummary(gym.logs);
  const done = s.items.filter((i) => i.done).length + s.blocksDone;
  const total = s.items.length + s.blocksTotal;
  const row = gym.dayRow();
  const at = row?.completedAt ? new Date(row.completedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "";
  const changes = s.items.filter(({ it }) => it.progressedOn === s.day && it.prevWeight !== undefined && it.weight !== it.prevWeight);

  return (
    <div className="border-t border-rock/70 px-4 py-3">
      <AnimatePresence mode="wait" initial={false}>
        {s.completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: easeOutExpo }} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold">
                <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5 }} className="grid h-6 w-6 place-items-center rounded-full bg-signal text-white">
                  <Check className="h-3.5 w-3.5" />
                </motion.span>
                {L("Rutina completa", "Workout complete")}
                {at && <span className="label-mono text-muted-foreground">{at}</span>}
              </p>
              <button onClick={() => gym.setCompleted(false)} className="label-mono inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
                <Undo2 className="h-3 w-3" /> {L("Desmarcar", "Unmark")}
              </button>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {total > 0 && <>{done}/{total} · </>}{s.sets} {L("series", "sets")} · {Math.round(fromKg(s.volume, gym.unit)).toLocaleString(locale)} {gym.unit}
            </p>
            {changes.length > 0 && (
              <p className="font-mono text-[11px] text-signal">
                {changes.map(({ it }) => `${it.exercise} → ${it.weight === null ? "—" : formatKg(it.weight)} ${it.unit}`).join(" · ")}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="todo"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: easeOutExpo }}
            whileTap={{ scale: 0.97 }}
            onClick={() => gym.setCompleted(true)}
            className={cn("label-mono flex w-full items-center justify-center gap-2 rounded-full py-2.5 transition-colors",
              total > 0 && done >= total ? "bg-signal text-white" : "border border-foreground hover:bg-foreground hover:text-background")}
          >
            <Check className="h-3.5 w-3.5" /> {L("Marcar rutina completa", "Mark workout complete")}
            {total > 0 && <span className="opacity-70">· {done}/{total}</span>}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlanToday({ gym, onPick, onCreate }: { gym: GymApi; onPick: (t: string) => void; onCreate: () => void }) {
  const { L } = useLang();
  const today = isoDow();
  const [dow, setDow] = useState(today);
  const day = gym.plan?.days.find((d) => d.dow === dow);

  const summary = gym.todaySummary(gym.logs);
  const doneCount = summary.items.filter((i) => i.done).length;

  if (!gym.plan) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-start justify-center gap-3 border border-dashed border-rock/70 p-6">
        <p className="label-mono text-muted-foreground">{L("Hoy", "Today")}</p>
        <p className="text-sm text-muted-foreground">{L("Cuando armes tu rutina, aquí verás lo que te toca cada día y cuándo subir de peso.", "Once you build your routine, today's session and when to go up in weight show here.")}</p>
        <button onClick={onCreate} className="label-mono rounded-full border border-foreground px-4 py-2 transition-colors hover:bg-foreground hover:text-background">{L("Crear mi rutina →", "Create my routine →")}</button>
      </div>
    );
  }

  return (
    <div className="flex h-[560px] flex-col border border-rock/70">
      <div className="flex items-center justify-between gap-2 border-b border-rock/70 px-3 py-2">
        {DOW_SHORT.map(([es, en], i) => {
          const d = i + 1;
          const completed = !!gym.dayRow(dateOfDow(d))?.completedAt;
          return (
            <button
              key={d}
              onClick={() => setDow(d)}
              className={cn("label-mono relative grid h-8 w-8 place-items-center rounded-full transition-colors", dow === d ? "text-background" : "text-muted-foreground hover:text-foreground")}
            >
              {dow === d && <motion.span layoutId="plan-dow" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{L(es, en)}</span>
              {completed ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-signal text-white" title={L("Rutina completa", "Workout complete")}>
                  <Check className="h-2.5 w-2.5" />
                </span>
              ) : d === today && dow !== d && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-signal" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dow}
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: easeOutExpo }}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          <p className="label-mono text-muted-foreground">
            {dow === today ? L("Hoy", "Today") : L(...DOW_LONG[dow - 1])}
            {dow === today && day?.items.length ? <span className="ml-2 text-signal">{doneCount}/{day.items.length}</span> : null}
          </p>
          <p className="font-display text-xl font-semibold leading-tight">{day?.title ?? L("Descanso", "Rest")}</p>
          {day?.note && <p className="mt-1 text-xs text-muted-foreground">{day.note}</p>}

          {day?.items.length ? (
            <ul className="mt-3">
              {day.items.map((it) => (
                <PlanRow key={it.exercise} it={it} gym={gym} onPick={onPick} isToday={dow === today} />
              ))}
            </ul>
          ) : null}
          {day?.blocks?.length ? <div className="mt-4"><BlockChecklist blocks={day.blocks} gym={gym} isToday={dow === today} /></div> : null}
        </motion.div>
      </AnimatePresence>
      {dow === today && <CompleteBar gym={gym} />}
    </div>
  );
}
