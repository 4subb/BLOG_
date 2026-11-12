import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { GymExercise } from "@shared/schema";
import { EXERCISE_LIBRARY, MOVEMENT_PATTERNS, MUSCLE_GROUPS, MUSCLE_LABELS, findInLibrary, formatKg, type MovementPattern, type MuscleGroup } from "@shared/gym";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import ExerciseFigure from "./ExerciseFigure";
import type { ExerciseStats, GymApi } from "./useGym";

const PATTERN_LABELS: Record<MovementPattern, [string, string]> = {
  press: ["Press horizontal", "Horizontal press"], incline: ["Press inclinado", "Incline press"], dip: ["Fondos", "Dips"],
  pull: ["Tirón vertical", "Vertical pull"], row: ["Remo", "Row"], hinge: ["Bisagra de cadera", "Hip hinge"],
  squat: ["Sentadilla", "Squat"], legpress: ["Prensa", "Leg press"], lunge: ["Zancada", "Lunge"],
  overhead: ["Press vertical", "Overhead press"], raise: ["Elevación", "Raise"], curl: ["Curl", "Curl"],
  extension: ["Extensión (polea)", "Pushdown"], core: ["Core", "Core"],
  legcurl: ["Curl femoral", "Leg curl"], legext: ["Extensión de cuádriceps", "Leg extension"], calf: ["Pantorrilla", "Calf raise"],
};

function Sparkline({ series }: { series: ExerciseStats["series"] }) {
  const pts = series.slice(-12);
  if (pts.length < 2) return <div className="h-8" />;
  const ws = pts.map((p) => p.weight);
  const min = Math.min(...ws), max = Math.max(...ws), span = max - min || 1;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 100} ${28 - ((p.weight - min) / span) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full" fill="none" aria-hidden>
      <motion.path
        d={d} vectorEffect="non-scaling-stroke" strokeWidth="1.5" className="stroke-signal"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.2, ease: easeOutExpo }}
      />
    </svg>
  );
}

function ExerciseCard({ ex, stats, onPick, onRemove }: { ex: GymExercise; stats?: ExerciseStats; onPick: () => void; onRemove: () => void }) {
  const { L, locale } = useLang();
  const [hover, setHover] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const group = MUSCLE_LABELS[ex.muscleGroup as MuscleGroup];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => { setHover(false); setConfirm(false); }}
      className="group relative flex flex-col border border-rock/70 bg-background transition-colors hover:border-foreground"
    >
      <button onClick={onPick} className="flex flex-1 flex-col text-left" title={L("Registrar en el chat", "Log in chat")}>
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-rock/50 bg-muted/20">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <ExerciseFigure pattern={ex.pattern} active={hover ? true : undefined} className="absolute inset-0 m-auto h-[82%] w-[82%]" />
          {stats && stats.best > 0 && (
            <span className="label-mono absolute left-3 top-3 bg-background/80 px-1.5 text-foreground">PR {formatKg(stats.best)} kg</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="label-mono text-muted-foreground">{group ? L(group.es, group.en) : ex.muscleGroup}</p>
          <p className="font-display text-lg font-semibold leading-tight">{ex.name}</p>
          {stats ? (
            <>
              <p className="font-mono text-xs text-muted-foreground">
                {stats.best1RM > 0 && <>1RM≈{Math.round(stats.best1RM)} kg · </>}
                {stats.sessions} {L(stats.sessions === 1 ? "sesión" : "sesiones", stats.sessions === 1 ? "session" : "sessions")}
                {stats.last && <> · {new Date(stats.last.date).toLocaleDateString(locale, { day: "numeric", month: "short" })}</>}
              </p>
              <div className="mt-auto pt-2"><Sparkline series={stats.series} /></div>
            </>
          ) : (
            <p className="mt-auto pt-2 font-mono text-xs text-muted-foreground/70">{L("Sin registros aún", "No entries yet")}</p>
          )}
        </div>
      </button>

      <button
        onClick={() => (confirm ? onRemove() : setConfirm(true))}
        className={cn(
          "label-mono absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100",
          confirm ? "text-signal" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={L("Quitar del catálogo", "Remove from catalog")}
      >
        {confirm ? L("¿Quitar?", "Remove?") : <X className="h-3 w-3" />}
      </button>
    </motion.div>
  );
}

function AddExercise({ gym, onDone }: { gym: GymApi; onDone: () => void }) {
  const { L } = useLang();
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("pecho");
  const [pattern, setPattern] = useState<MovementPattern>("press");
  const [aliases, setAliases] = useState("");
  const [bodyweight, setBodyweight] = useState(false);
  const [error, setError] = useState("");

  // Si el nombre coincide con un ejercicio conocido, rellena grupo, animación y alias
  const onName = (v: string) => {
    setName(v);
    const known = findInLibrary(v);
    if (!known) return;
    setGroup(known.muscleGroup);
    setPattern(known.pattern);
    setBodyweight(!!known.bodyweight);
    setAliases(known.aliases.join(", "));
  };
  const taken = new Set(gym.exercises.map((e) => e.name));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await gym.addExercise.mutateAsync({
        name: name.trim(), muscleGroup: group, pattern, bodyweight,
        aliases: aliases.split(",").map((a) => a.trim()).filter((a) => a.length >= 2),
      });
      onDone();
    } catch (err) {
      setError(String(err).includes("409") ? L("Ya existe en tu catálogo.", "Already in your catalog.") : L("No se pudo guardar.", "Couldn't save."));
    }
  };

  const field = "h-10 w-full rounded-md border border-rock bg-transparent px-3 text-sm outline-none focus:border-foreground";
  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="grid gap-4 border border-dashed border-rock/70 p-5 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1"><span className="label-mono text-muted-foreground">{L("Nombre", "Name")}</span>
            <input required minLength={2} maxLength={60} value={name} onChange={(e) => onName(e.target.value)} className={field} placeholder={L("Press banca, sentadilla…", "Bench press, squat…")} list="gym-library" autoFocus />
            <datalist id="gym-library">{EXERCISE_LIBRARY.filter((x) => !taken.has(x.name)).map((x) => <option key={x.name} value={x.name} />)}</datalist></label>
          <label className="space-y-1"><span className="label-mono text-muted-foreground">{L("Alias para el chat (coma)", "Chat aliases (comma)")}</span>
            <input value={aliases} onChange={(e) => setAliases(e.target.value)} className={field} placeholder="facepull, jalon a la cara" /></label>
          <label className="space-y-1"><span className="label-mono text-muted-foreground">{L("Grupo", "Group")}</span>
            <select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)} className={field}>
              {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{L(MUSCLE_LABELS[g].es, MUSCLE_LABELS[g].en)}</option>)}
            </select></label>
          <label className="space-y-1"><span className="label-mono text-muted-foreground">{L("Animación", "Animation")}</span>
            <select value={pattern} onChange={(e) => setPattern(e.target.value as MovementPattern)} className={field}>
              {MOVEMENT_PATTERNS.map((p) => <option key={p} value={p}>{L(...PATTERN_LABELS[p])}</option>)}
            </select></label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={bodyweight} onChange={(e) => setBodyweight(e.target.checked)} />
            {L("Peso corporal (sin peso = 0 kg)", "Bodyweight (no weight = 0 kg)")}
          </label>
          {error && <p className="text-sm text-signal sm:col-span-2">{error}</p>}
        </div>
        <div className="flex items-center justify-center sm:w-40">
          <ExerciseFigure pattern={pattern} active className="h-32 w-32" />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={gym.addExercise.isPending} className="label-mono h-10 rounded-full bg-foreground px-5 text-background disabled:opacity-50">{L("Añadir", "Add")}</button>
          <button type="button" onClick={onDone} className="label-mono h-10 rounded-full border border-rock px-5">{L("Cancelar", "Cancel")}</button>
        </div>
      </div>
    </motion.form>
  );
}

export default function ExerciseGrid({ gym, onPick }: { gym: GymApi; onPick: (name: string) => void }) {
  const { L } = useLang();
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");
  const [adding, setAdding] = useState(false);
  const list = gym.exercises.filter((e) => filter === "all" || e.muscleGroup === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={cn("label-mono relative rounded-full px-3 py-1.5 transition-colors", filter === g ? "text-background" : "text-muted-foreground hover:text-foreground")}
          >
            {filter === g && <motion.span layoutId="gym-filter" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <span className="relative">{g === "all" ? L("Todos", "All") : L(MUSCLE_LABELS[g].es, MUSCLE_LABELS[g].en)}</span>
          </button>
        ))}
        <button onClick={() => setAdding((v) => !v)} className="label-mono ml-auto inline-flex items-center gap-1 rounded-full border border-foreground px-3 py-1.5 transition-colors hover:bg-foreground hover:text-background">
          <Plus className="h-3 w-3" /> {L("Ejercicio", "Exercise")}
        </button>
      </div>

      <AnimatePresence>{adding && <AddExercise gym={gym} onDone={() => setAdding(false)} />}</AnimatePresence>

      {!gym.exercises.length && !adding && (
        <div className="border border-dashed border-rock/70 p-8">
          <p className="font-display text-lg font-semibold">{L("Tu catálogo está vacío", "Your catalog is empty")}</p>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            {L("Añade los ejercicios que haces con «+ Ejercicio» (te sugiere los más comunes), o escríbelos directamente en el chat y te preguntará si los guardas.",
               "Add the exercises you do with \"+ Exercise\" (common ones are suggested), or just type them in the chat and it'll offer to save them.")}
          </p>
        </div>
      )}

      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((ex) => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              stats={gym.statsFor(ex.name)}
              onPick={() => onPick(ex.name)}
              onRemove={() => gym.removeExercise.mutate(ex.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
