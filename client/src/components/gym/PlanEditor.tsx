import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { GymPlan, PlanBlock, PlanDay, PlanItem } from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { DOW_LONG } from "./PlanToday";
import type { GymApi } from "./useGym";

// Editor de rutina semanal: cada usuario arma la suya. Los ejercicios salen de su catálogo.
// Bloques de días sin pesas en texto: "# Título" abre un bloque y cada línea siguiente es un punto.

const blocksToText = (blocks?: PlanBlock[]) => (blocks ?? []).map((b) => [`# ${b.title}`, ...b.lines].join("\n")).join("\n");
function textToBlocks(text: string): PlanBlock[] {
  const out: PlanBlock[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) out.push({ title: line.replace(/^#+\s*/, "").slice(0, 60) || "Notas", lines: [] });
    else {
      if (!out.length) out.push({ title: "Notas", lines: [] });
      out[out.length - 1].lines.push(line.slice(0, 200));
    }
  }
  return out.filter((b) => b.lines.length).slice(0, 6).map((b) => ({ ...b, lines: b.lines.slice(0, 20) }));
}

const emptyDay = (dow: number): PlanDay => ({ dow, title: "", kind: dow >= 6 ? "rest" : "gym", items: [] });

type DraftDay = PlanDay & { blocksText: string };

export default function PlanEditor({ gym, onClose }: { gym: GymApi; onClose: () => void }) {
  const { L } = useLang();
  const [days, setDays] = useState<DraftDay[]>(() =>
    [1, 2, 3, 4, 5, 6, 7].map((dow) => {
      const d = gym.plan?.days.find((x) => x.dow === dow) ?? emptyDay(dow);
      return { ...d, items: d.items.map((i) => ({ ...i })), blocksText: blocksToText(d.blocks) };
    }));
  const [rules, setRules] = useState((gym.plan?.rules ?? []).join("\n"));
  const [error, setError] = useState("");
  const names = gym.exercises.map((e) => e.name);

  const setDay = (dow: number, fn: (d: DraftDay) => DraftDay) => setDays((ds) => ds.map((d) => (d.dow === dow ? fn(d) : d)));
  const setItem = (dow: number, idx: number, patch: Partial<PlanItem>) =>
    setDay(dow, (d) => ({ ...d, items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));

  const save = async () => {
    setError("");
    for (const d of days) for (const it of d.items) {
      if (!it.exercise) return setError(L(`Falta elegir un ejercicio el ${DOW_LONG[d.dow - 1][0].toLowerCase()}.`, `Pick an exercise on ${DOW_LONG[d.dow - 1][1]}.`));
      if (it.reps !== "max" && it.reps[0] > it.reps[1]) return setError(L(`${it.exercise}: el mínimo de reps es mayor que el máximo.`, `${it.exercise}: min reps is above max.`));
    }
    const plan: GymPlan = {
      days: days.map(({ blocksText, ...d }) => {
        const blocks = textToBlocks(blocksText);
        return { ...d, title: d.title.trim().slice(0, 80), note: d.note?.trim() || undefined, blocks: blocks.length ? blocks : undefined };
      }),
      rules: rules.split("\n").map((r) => r.trim()).filter(Boolean).slice(0, 12),
    };
    try { await gym.savePlan.mutateAsync(plan); onClose(); }
    catch { setError(L("No se pudo guardar la rutina.", "Couldn't save the routine.")); }
  };

  const field = "h-9 rounded-md border border-rock bg-transparent px-2 text-sm outline-none focus:border-foreground";
  const num = (v: string, min = 0) => Math.max(min, Number.isFinite(parseFloat(v)) ? parseFloat(v) : min);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {!names.length && (
        <p className="border border-dashed border-signal/60 p-4 text-sm">
          {L("Primero añade ejercicios a tu catálogo (sección «Mis ejercicios» o desde el chat); aquí eliges entre ellos.",
             "First add exercises to your catalog (\"My exercises\" or via the chat); you pick from them here.")}
        </p>
      )}

      <div className="grid gap-px border border-rock/70 bg-rock/70 lg:grid-cols-2">
        {days.map((d) => (
          <div key={d.dow} className="space-y-3 bg-background p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono w-24 text-muted-foreground">{L(...DOW_LONG[d.dow - 1])}</span>
              <input
                value={d.title} maxLength={80} onChange={(e) => setDay(d.dow, (x) => ({ ...x, title: e.target.value }))}
                placeholder={L("Título (p. ej. Torso A)", "Title (e.g. Upper A)")} className={cn(field, "min-w-0 flex-1")}
              />
              <select value={d.kind} onChange={(e) => setDay(d.dow, (x) => ({ ...x, kind: e.target.value as PlanDay["kind"] }))} className={field}>
                <option value="gym">{L("Pesas", "Weights")}</option>
                <option value="cardio">{L("Cardio / movilidad", "Cardio / mobility")}</option>
                <option value="rest">{L("Descanso", "Rest")}</option>
              </select>
            </div>

            {d.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 border-t border-rock/40 pt-3">
                <select value={it.exercise} onChange={(e) => setItem(d.dow, idx, { exercise: e.target.value })} className={cn(field, "col-span-5")}>
                  <option value="">{L("— ejercicio —", "— exercise —")}</option>
                  {(names.includes(it.exercise) || !it.exercise ? names : [it.exercise, ...names]).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={() => setDay(d.dow, (x) => ({ ...x, items: x.items.filter((_, i) => i !== idx) }))} className="grid place-items-center text-muted-foreground hover:text-signal" aria-label={L("Quitar", "Remove")}>
                  <X className="h-4 w-4" />
                </button>

                <label className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                  {L("Series", "Sets")}
                  <input type="number" min={1} max={20} value={it.sets} onChange={(e) => setItem(d.dow, idx, { sets: Math.min(20, num(e.target.value, 1)) })} className={cn(field, "w-14")} />
                </label>
                <div className="col-span-4 flex items-center gap-1 text-xs text-muted-foreground">
                  Reps
                  {it.reps === "max" ? (
                    <span className="font-mono text-foreground">{L("máx", "max")}</span>
                  ) : (
                    <>
                      <input type="number" min={1} max={100} value={it.reps[0]} onChange={(e) => setItem(d.dow, idx, { reps: [num(e.target.value, 1), (it.reps as [number, number])[1]] })} className={cn(field, "w-14")} />
                      –
                      <input type="number" min={1} max={100} value={it.reps[1]} onChange={(e) => setItem(d.dow, idx, { reps: [(it.reps as [number, number])[0], num(e.target.value, 1)] })} className={cn(field, "w-14")} />
                    </>
                  )}
                  <label className="ml-1 flex items-center gap-1">
                    <input type="checkbox" checked={it.reps === "max"} onChange={(e) => setItem(d.dow, idx, { reps: e.target.checked ? "max" : [8, 12] })} />
                    {L("al fallo", "to failure")}
                  </label>
                </div>

                <input
                  inputMode="decimal" value={it.weight ?? ""} placeholder={L("Peso corp.", "BW")}
                  onChange={(e) => { const v = e.target.value.replace(",", "."); setItem(d.dow, idx, { weight: v === "" ? null : Math.min(1000, num(v)) }); }}
                  className={cn(field, "col-span-2")} aria-label={L("Peso objetivo", "Target weight")}
                />
                <select value={it.unit} onChange={(e) => setItem(d.dow, idx, { unit: e.target.value as PlanItem["unit"] })} className={field}>
                  <option value="kg">kg</option><option value="lb">lb</option>
                </select>
                <select value={it.per} onChange={(e) => setItem(d.dow, idx, { per: e.target.value as PlanItem["per"] })} className={cn(field, "col-span-3")}>
                  <option value="total">{L("total", "total")}</option>
                  <option value="lado">{L("por lado", "per side")}</option>
                  <option value="mano">{L("por mano", "per hand")}</option>
                  <option value="pierna">{L("por pierna", "per leg")}</option>
                </select>
                <input
                  value={it.note ?? ""} maxLength={200} placeholder={L("Nota (opcional)", "Note (optional)")}
                  onChange={(e) => setItem(d.dow, idx, { note: e.target.value || undefined })} className={cn(field, "col-span-6")}
                />
              </div>
            ))}

            {d.items.length < 20 && (
              <button
                onClick={() => setDay(d.dow, (x) => ({ ...x, kind: "gym", items: [...x.items, { exercise: "", sets: 3, reps: [8, 12], weight: null, unit: "kg", per: "total" }] }))}
                className="label-mono inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> {L("Ejercicio", "Exercise")}
              </button>
            )}

            <textarea
              value={d.blocksText} rows={d.blocksText ? 4 : 2}
              onChange={(e) => setDay(d.dow, (x) => ({ ...x, blocksText: e.target.value }))}
              placeholder={L("Otras actividades: «# Carrera» y debajo una línea por punto", "Other activities: \"# Run\" then one line per item")}
              className="w-full rounded-md border border-rock bg-transparent p-2 font-mono text-xs outline-none focus:border-foreground"
            />
          </div>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="label-mono text-muted-foreground">{L("Reglas (una por línea)", "Rules (one per line)")}</span>
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={3} className="w-full rounded-md border border-rock bg-transparent p-2 text-sm outline-none focus:border-foreground" />
      </label>

      {error && <p className="text-sm text-signal">{error}</p>}
      <div className="flex gap-2">
        <button onClick={save} disabled={gym.savePlan.isPending} className="label-mono h-10 rounded-full bg-foreground px-5 text-background disabled:opacity-50">
          {L("Guardar rutina", "Save routine")}
        </button>
        <button onClick={onClose} className="label-mono h-10 rounded-full border border-rock px-5">{L("Cancelar", "Cancel")}</button>
      </div>
    </motion.div>
  );
}
