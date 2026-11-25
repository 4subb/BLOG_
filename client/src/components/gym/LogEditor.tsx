import { useState, type FormEvent } from "react";
import { EXERCISE_LIBRARY, formatKg, fromKg, sameExercise, toKgFrom } from "@shared/gym";
import { useLang } from "@/lib/lang";
import type { GymApi } from "./useGym";

export type LogFields = { exercise: string; weight: number; sets: number; reps: number };

/** Corrige un registro en su sitio: ejercicio (con sugerencias), series, reps y peso en la unidad del usuario. */
export default function LogEditor({ gym, value, onSave, onCancel }: {
  gym: GymApi; value: LogFields; onSave: (f: LogFields) => void | Promise<void>; onCancel: () => void;
}) {
  const { L } = useLang();
  const [exercise, setExercise] = useState(value.exercise);
  const [sets, setSets] = useState(String(value.sets));
  const [reps, setReps] = useState(String(value.reps));
  const initialWeight = formatKg(fromKg(value.weight, gym.unit));
  const [weight, setWeight] = useState(initialWeight);

  const names = Array.from(new Set([
    ...(gym.plan?.days.flatMap((d) => d.items.map((i) => i.exercise)) ?? []),
    ...gym.exercises.map((e) => e.name),
    ...EXERCISE_LIBRARY.map((e) => e.name),
  ]));
  const w = Number(weight.replace(",", "."));
  const kg = weight === initialWeight ? value.weight : toKgFrom(w, gym.unit); // sin tocar: no se pierde precisión
  const valid = exercise.trim().length > 0 && exercise.trim().length <= 80 && Number.isFinite(w) && kg >= 0 && kg <= 1000
    && Number.isInteger(+sets) && +sets >= 1 && +sets <= 50 && Number.isInteger(+reps) && +reps >= 1 && +reps <= 500;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // "sentadilla barra libre" → el nombre que ya usa
    const typed = exercise.trim();
    const name = names.includes(typed) || typed === value.exercise ? typed : names.find((n) => sameExercise(n, typed)) ?? typed;
    void onSave({ exercise: name, weight: kg, sets: +sets, reps: +reps });
  };
  const field = "h-9 rounded border border-rock bg-transparent px-2 font-mono text-sm outline-none focus:border-foreground";

  return (
    <form onSubmit={submit} className="flex w-full basis-full flex-wrap items-center gap-2 py-2">
      <input list="gym-exercise-names" value={exercise} onChange={(e) => setExercise(e.target.value)} className={`${field} min-w-[11rem] flex-1`} aria-label={L("Ejercicio", "Exercise")} />
      <datalist id="gym-exercise-names">{names.map((n) => <option key={n} value={n} />)}</datalist>
      <input inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} className={`${field} w-12 text-center`} aria-label={L("Series", "Sets")} />
      <span className="text-muted-foreground">×</span>
      <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} className={`${field} w-14 text-center`} aria-label={L("Repeticiones", "Reps")} />
      <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={`${field} w-16 text-center`} aria-label={L("Peso", "Weight")} />
      <span className="label-mono text-muted-foreground">{gym.unit}</span>
      <button type="submit" disabled={!valid || gym.updateLog.isPending} className="label-mono h-9 rounded-full bg-foreground px-4 text-background disabled:opacity-40">{L("Guardar", "Save")}</button>
      <button type="button" onClick={onCancel} className="label-mono h-9 px-2 text-muted-foreground hover:text-foreground">{L("Cancelar", "Cancel")}</button>
    </form>
  );
}
