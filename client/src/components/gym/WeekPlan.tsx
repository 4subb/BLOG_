import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { formatKg, isoDow, repsLabel, weightLabel, type PlanItem } from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { DOW_LONG, dateOfDow, prefillFor } from "./PlanToday";
import type { GymApi } from "./useGym";

/** Peso editable en línea: clic → input; Enter/blur guarda, Esc cancela */
function WeightCell({ it, gym }: { it: PlanItem; gym: GymApi }) {
  const { es, L } = useLang();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  if (it.weight === null) return <span className="text-muted-foreground">{weightLabel(it, es)}</span>;

  const commit = () => {
    const n = parseFloat(val.replace(",", "."));
    if (Number.isFinite(n) && n >= 0 && n <= 1000 && n !== it.weight) gym.setPlanWeight(it.exercise, n);
    setEditing(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); };

  return editing ? (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={onKey}
        inputMode="decimal" className="h-6 w-16 rounded border border-foreground bg-transparent px-1 font-mono text-xs outline-none"
        aria-label={L("Peso objetivo", "Target weight")}
      />
      <span className="text-muted-foreground">{it.unit}</span>
    </span>
  ) : (
    <button
      onClick={() => { setVal(formatKg(it.weight!)); setEditing(true); }}
      className="border-b border-dashed border-rock transition-colors hover:border-signal hover:text-signal"
      title={L("Editar peso objetivo", "Edit target weight")}
    >
      {weightLabel(it, es)}
    </button>
  );
}

export default function WeekPlan({ gym, onPick }: { gym: GymApi; onPick: (t: string) => void }) {
  const { L } = useLang();
  const today = isoDow();
  if (!gym.plan) return null;
  const days = [...gym.plan.days].sort((a, b) => a.dow - b.dow);

  return (
    <div className="space-y-8">
      <motion.div
        variants={staggerContainer(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}
        className="grid gap-px border border-rock/70 bg-rock/70 sm:grid-cols-2 xl:grid-cols-3"
      >
        {days.map((d) => (
          <motion.div key={d.dow} variants={fadeUp} className={cn("relative bg-background p-5", d.dow === today && "ring-1 ring-inset ring-signal")}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="label-mono text-muted-foreground">{L(...DOW_LONG[d.dow - 1])}</p>
              {gym.dayRow(dateOfDow(d.dow))?.completedAt
                ? <span className="label-mono text-signal">✓ {L("Completa", "Done")}</span>
                : d.dow === today && <span className="label-mono text-signal">{L("Hoy", "Today")}</span>}
            </div>
            <p className="font-display text-lg font-semibold">{d.title}</p>
            {d.items.length > 0 && (
              <ul className="mt-3 space-y-2">
                {d.items.map((it) => {
                  const v = gym.verdictFor(it, gym.logs);
                  const pending = (v.kind === "up" || v.kind === "deload") && v.next !== it.weight && it.progressedOn !== v.session?.day;
                  return (
                    <li key={it.exercise} className="text-sm">
                      <button onClick={() => onPick(prefillFor(it))} className="text-left font-medium hover:text-signal">{it.exercise}</button>
                      <div className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                        <span>{it.sets}×{repsLabel(it)}</span>·<WeightCell it={it} gym={gym} />
                        {pending && v.next !== null && (
                          <button onClick={() => gym.applyVerdict(it, v)} className="text-signal hover:underline" title={L(v.why.es, v.why.en)}>
                            {v.kind === "up" ? "↑" : "↓"} {formatKg(v.next)}
                          </button>
                        )}
                      </div>
                      {v.kind !== "new" && v.kind !== "incomplete" && (
                        <p className="text-[11px] text-muted-foreground" title={L(v.why.es, v.why.en)}>→ {L(v.goal.es, v.goal.en)}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {d.blocks?.map((b) => (
              <div key={b.title} className="mt-3">
                <p className="label-mono text-muted-foreground">{b.title}</p>
                <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">{b.lines.map((l) => <li key={l}>{l}</li>)}</ul>
              </div>
            ))}
          </motion.div>
        ))}
      </motion.div>

      {gym.plan.rules.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {gym.plan.rules.map((r, i) => (
            <p key={r} className="flex gap-3 text-sm text-muted-foreground">
              <span className="label-mono text-foreground">{String(i + 1).padStart(2, "0")}</span>{r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
