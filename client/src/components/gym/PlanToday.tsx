import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check } from "lucide-react";
import { formatKg, isoDow, normalize, progressFor, repsLabel, weightLabel, type PlanBlock, type PlanItem } from "@shared/gym";
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
const todayKey = () => new Date().toLocaleDateString("sv-SE");

/** Texto que se precarga en el chat al tocar un ejercicio del plan */
export const prefillFor = (it: PlanItem) =>
  it.reps === "max" || it.weight === null
    ? `${it.exercise.toLowerCase()} `
    : `${it.exercise.toLowerCase()} ${formatKg(it.weight)}${it.unit === "lb" ? " lb" : "kg"} ${it.sets}x`;

function PlanRow({ it, gym, done, onPick }: { it: PlanItem; gym: GymApi; done: boolean; onPick: (t: string) => void }) {
  const { L, es } = useLang();
  const pr = progressFor(it, gym.logs);
  const pattern = gym.exercises.find((e) => e.name === it.exercise)?.pattern ?? "curl";
  const [hover, setHover] = useState(false);

  return (
    <motion.li
      layout
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={cn("group flex items-start gap-3 border-t border-rock/50 py-3 first:border-t-0", done && "opacity-60")}
    >
      <ExerciseFigure pattern={pattern} active={hover} className="h-11 w-11 shrink-0" />
      <button onClick={() => onPick(prefillFor(it))} className="min-w-0 flex-1 text-left" title={L("Registrar en el chat", "Log in chat")}>
        <p className="flex items-center gap-2 font-semibold leading-tight">
          {done && <Check className="h-3.5 w-3.5 text-signal" />}
          <span className={cn("truncate", done && "line-through decoration-rock")}>{it.exercise}</span>
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {it.sets}×{repsLabel(it)} · <span className="text-foreground">{weightLabel(it, es)}</span>
        </p>
        {it.note && <p className="mt-0.5 text-xs text-muted-foreground/80">{it.note}</p>}
        {pr.status !== "new" && <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{L("Última", "Last")}: {pr.last}</p>}
      </button>
      {pr.status === "up" && (
        <motion.button
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => gym.setPlanWeight(it.exercise, pr.next)}
          className="label-mono inline-flex shrink-0 items-center gap-1 rounded-full bg-signal px-2.5 py-1 text-white"
          title={L("Completaste el tope del rango en todas las series", "You hit the top of the range on every set")}
        >
          <ArrowUp className="h-3 w-3" /> {formatKg(pr.next)} {it.unit}
        </motion.button>
      )}
    </motion.li>
  );
}

/** Checklist para días sin pesas (carrera, movilidad, core); se recuerda por fecha en este navegador */
function BlockChecklist({ blocks, dow }: { blocks: PlanBlock[]; dow: number }) {
  const key = `gym-check:${todayKey()}:${dow}`;
  const [checked, setChecked] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; } });
  useEffect(() => { try { setChecked(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { setChecked([]); } }, [key]);
  const toggle = (id: string) => {
    const next = checked.includes(id) ? checked.filter((c) => c !== id) : [...checked, id];
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
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
                <li key={line}>
                  <button onClick={() => toggle(id)} className="flex w-full items-start gap-2 text-left text-sm">
                    <span className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-sm border transition-colors", on ? "border-signal bg-signal text-white" : "border-rock")}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className={cn("transition-colors", on && "text-muted-foreground line-through")}>{line}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function PlanToday({ gym, onPick, onCreate }: { gym: GymApi; onPick: (t: string) => void; onCreate: () => void }) {
  const { L } = useLang();
  const today = isoDow();
  const [dow, setDow] = useState(today);
  const day = gym.plan?.days.find((d) => d.dow === dow);

  const loggedToday = new Set(gym.logs.filter((l) => new Date(l.date).toLocaleDateString("sv-SE") === todayKey()).map((l) => normalize(l.exercise)));
  const doneCount = day?.items.filter((i) => loggedToday.has(normalize(i.exercise))).length ?? 0;

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
          return (
            <button
              key={d}
              onClick={() => setDow(d)}
              className={cn("label-mono relative grid h-8 w-8 place-items-center rounded-full transition-colors", dow === d ? "text-background" : "text-muted-foreground hover:text-foreground")}
            >
              {dow === d && <motion.span layoutId="plan-dow" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{L(es, en)}</span>
              {d === today && dow !== d && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-signal" />}
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
                <PlanRow key={it.exercise} it={it} gym={gym} onPick={onPick} done={dow === today && loggedToday.has(normalize(it.exercise))} />
              ))}
            </ul>
          ) : null}
          {day?.blocks?.length ? <div className="mt-4"><BlockChecklist blocks={day.blocks} dow={dow} /></div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
