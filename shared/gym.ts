// Gym: catálogo base + analizador de texto libre del chat de registro.
// Vive en shared/ porque lo usan el cliente (interpretar el mensaje al vuelo) y el servidor
// (sembrar el catálogo). Es puro: sin dependencias de DB ni de React.

export const MUSCLE_GROUPS = ["pecho", "espalda", "piernas", "hombros", "brazos", "core"] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// Cada patrón tiene su animación en client/src/components/gym/ExerciseFigure.tsx
export const MOVEMENT_PATTERNS = [
  "press", "incline", "dip", "pull", "row", "hinge", "squat", "legpress", "lunge",
  "overhead", "raise", "curl", "extension", "core", "legcurl", "legext", "calf",
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const MUSCLE_LABELS: Record<MuscleGroup, { es: string; en: string }> = {
  pecho: { es: "Pecho", en: "Chest" },
  espalda: { es: "Espalda", en: "Back" },
  piernas: { es: "Piernas", en: "Legs" },
  hombros: { es: "Hombros", en: "Shoulders" },
  brazos: { es: "Brazos", en: "Arms" },
  core: { es: "Core", en: "Core" },
};

export type ExerciseDef = {
  name: string;
  muscleGroup: MuscleGroup;
  pattern: MovementPattern;
  aliases: string[];
  bodyweight?: boolean;
};

// Biblioteca de ejercicios conocidos: NO se copia a nadie. Sirve para sugerir nombre, grupo,
// animación y alias cuando un usuario añade un ejercicio a su propio catálogo (que empieza vacío).
export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // Pecho
  { name: "Press banca", muscleGroup: "pecho", pattern: "press", aliases: ["banca", "press de banca", "press plano", "bench", "bench press"] },
  { name: "Fly con mancuerna", muscleGroup: "pecho", pattern: "press", aliases: ["fly", "flyes", "aperturas", "apertura con mancuerna", "fly mancuerna"] },
  { name: "Fondos", muscleGroup: "pecho", pattern: "dip", aliases: ["fondo", "dips", "fondos en paralelas"], bodyweight: true },
  // Hombros
  { name: "Press militar", muscleGroup: "hombros", pattern: "overhead", aliases: ["militar", "press militar con barra", "press hombro", "ohp", "overhead press"] },
  { name: "Elevación lateral", muscleGroup: "hombros", pattern: "raise", aliases: ["elevaciones laterales", "laterales", "lateral", "lateral raise"] },
  { name: "Apertura invertida", muscleGroup: "hombros", pattern: "raise", aliases: ["aperturas invertidas", "reverse fly", "pajaros", "pajaro", "deltoides posterior"] },
  // Espalda
  { name: "Dominadas", muscleGroup: "espalda", pattern: "pull", aliases: ["dominada", "dominadas estrictas", "pull up", "pullups", "chin up"], bodyweight: true },
  { name: "Remo con barra", muscleGroup: "espalda", pattern: "row", aliases: ["remo", "remo barra", "barbell row"] },
  { name: "Pulldown", muscleGroup: "espalda", pattern: "pull", aliases: ["jalon", "jalon al pecho", "polea al pecho", "lat pulldown"] },
  { name: "Remo en banca al ombligo", muscleGroup: "espalda", pattern: "row", aliases: ["remo en banca", "remo banca", "remo al ombligo", "chest supported row"] },
  // Brazos
  { name: "Curl de bíceps", muscleGroup: "brazos", pattern: "curl", aliases: ["curl", "curl biceps", "biceps", "curl mancuerna", "curl barra"] },
  { name: "Extensión de tríceps en polea", muscleGroup: "brazos", pattern: "extension", aliases: ["triceps", "triceps polea", "extension de triceps", "extension triceps", "agarre v", "pushdown", "jalon triceps"] },
  // Piernas
  { name: "Sentadilla", muscleGroup: "piernas", pattern: "squat", aliases: ["sentadillas", "sentadilla barra libre", "sentadilla libre", "squat", "back squat"] },
  { name: "Peso muerto rumano", muscleGroup: "piernas", pattern: "hinge", aliases: ["rumano", "rdl", "peso muerto", "romanian deadlift"] },
  { name: "Prensa 90°", muscleGroup: "piernas", pattern: "legpress", aliases: ["prensa", "leg press", "prensa de piernas"] },
  { name: "Curl femoral unilateral", muscleGroup: "piernas", pattern: "legcurl", aliases: ["curl femoral", "femoral", "femoral unilateral", "leg curl"] },
  { name: "Pantorrilla sentado", muscleGroup: "piernas", pattern: "calf", aliases: ["pantorrilla", "pantorrillas", "gemelos", "soleo", "calf raise"] },
  { name: "Sentadilla búlgara", muscleGroup: "piernas", pattern: "lunge", aliases: ["bulgara", "bulgaras", "sentadillas bulgaras", "split squat"] },
  { name: "Hip thrust", muscleGroup: "piernas", pattern: "hinge", aliases: ["empuje de cadera", "puente de gluteo"] },
  { name: "Zancadas caminando", muscleGroup: "piernas", pattern: "lunge", aliases: ["zancadas", "zancada", "walking lunges", "lunges", "estocadas"] },
  { name: "Extensión de cuádriceps", muscleGroup: "piernas", pattern: "legext", aliases: ["extension de cuadriceps", "extension cuadriceps", "cuadriceps", "extensiones", "leg extension"] },
  // Otros habituales
  { name: "Press inclinado", muscleGroup: "pecho", pattern: "incline", aliases: ["inclinado", "banca inclinada", "incline press"] },
  { name: "Peso muerto convencional", muscleGroup: "espalda", pattern: "hinge", aliases: ["peso muerto", "deadlift"] },
  { name: "Remo con mancuerna", muscleGroup: "espalda", pattern: "row", aliases: ["remo mancuerna", "dumbbell row"] },
  { name: "Jalón al pecho", muscleGroup: "espalda", pattern: "pull", aliases: ["jalon", "polea al pecho", "lat pulldown"] },
  { name: "Abdominales", muscleGroup: "core", pattern: "core", aliases: ["abs", "crunch", "crunches", "encogimientos"], bodyweight: true },
];

/** Busca en la biblioteca por nombre o alias (sin acentos ni mayúsculas) */
export const findInLibrary = (name: string) => {
  const n = normalize(name.trim());
  return n ? EXERCISE_LIBRARY.find((e) => normalize(e.name) === n || e.aliases.some((a) => normalize(a) === n)) : undefined;
};

// ───────────────────────── utilidades ─────────────────────────

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[×*]/g, "x");

export const roundTo = (n: number, step = 0.25) => Math.round(n / step) * step;

/** 1RM estimado (Epley). Con 1 repetición es el propio peso. */
export const estimate1RM = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export const formatKg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));

function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Tolera erratas: 1 letra en palabras de 5+, 2 en palabras de 9+ ("sentadila", "dominadass")
function wordMatches(token: string, word: string) {
  if (token === word) return true;
  if (!/^[a-z]+$/.test(token) || word.length < 5) return false;
  return lev(token, word) <= (word.length >= 9 ? 2 : 1);
}

const FILLER = new Set(["de", "del", "en", "la", "el", "al", "con"]);

// ───────────────────────── analizador ─────────────────────────

export type CatalogItem = { name: string; aliases: string[]; bodyweight: boolean };
export type HistoryItem = { exercise: string; weight: number; sets: number; reps: number; date: string | Date };

export type ParsedEntry = {
  exercise: string;
  weight: number | null;
  sets: number | null;
  reps: number | null;
  /** Campos que no venían en el mensaje y se tomaron de la última sesión */
  assumed: Array<"weight" | "setsreps">;
};

export type ParseResult =
  | { intent: "undo" }
  | { intent: "help" }
  | { intent: "query"; exercise: string | null }
  | {
      intent: "log";
      dayOffset: number; // 0 = hoy, -1 = ayer...
      entries: ParsedEntry[];
      /** Entradas a las que les falta algo y no hay historial para suponerlo */
      incomplete: ParsedEntry[];
      /** Nombre que parece un ejercicio pero no está en el catálogo */
      unknownName: string | null;
    };

type Match = { start: number; end: number; name: string };

function findExercises(tokens: string[], catalog: CatalogItem[]): Match[] {
  // Todas las formas (nombre + alias) en palabras, de más larga a más corta: gana "peso muerto rumano"
  const forms = catalog
    .flatMap((c) => [c.name, ...c.aliases].map((f) => ({ words: normalize(f).split(/[^a-z]+/).filter(Boolean), name: c.name })))
    .filter((f) => f.words.length)
    .sort((a, b) => b.words.length - a.words.length);

  const out: Match[] = [];
  let i = 0;
  while (i < tokens.length) {
    let hit: Match | null = null;
    for (const f of forms) {
      let t = i, w = 0;
      while (w < f.words.length && t < tokens.length) {
        if (wordMatches(tokens[t], f.words[w])) { t++; w++; }
        else if (w > 0 && FILLER.has(tokens[t])) t++; // "press de banca" ≈ "press banca"
        else break;
      }
      if (w === f.words.length) { hit = { start: i, end: t, name: f.name }; break; }
    }
    if (hit) { out.push(hit); i = hit.end; } else i++;
  }
  return out;
}

const UNIT = "(kg|kgs|kilos?|k|lbs?|libras?)";
const NUM = "(\\d+(?:\\.\\d+)?)";
const toKg = (n: number, unit?: string) => (unit && /^(lb|libra)/.test(unit) ? roundTo(n * 0.4536, 0.5) : n);

type Group = { weight: number | null; sets: number | null; reps: number | null; pos: number };

/** Extrae series/repeticiones/peso de un trozo de texto que habla de UN ejercicio. */
export function parseNumbers(segment: string): Group[] {
  let rest = ` ${segment} `;
  const eat = (re: RegExp, fn: (m: string[], pos: number) => void) => {
    rest = rest.replace(re, (...args) => {
      const pos = args[args.length - 2] as number;
      fn(args.slice(0, -2) as string[], pos);
      return " ".repeat((args[0] as string).length); // conserva posiciones para emparejar por cercanía
    });
  };

  const groups: Group[] = [];
  const pairs: { a: number; unitA?: string; b: number; pos: number }[] = [];
  const weights: { v: number; pos: number; explicit: boolean }[] = [];
  let sets: number | null = null, reps: number | null = null;

  // 80x3x10  ·  3x10x80kg
  eat(new RegExp(`${NUM}\\s*${UNIT}?\\s*x\\s*(\\d+)\\s*x\\s*${NUM}\\s*${UNIT}?`, "g"), (m, pos) => {
    const a = +m[1], b = +m[3], c = +m[4];
    if (m[5] || (!m[2] && a <= 12 && c > 20)) groups.push({ sets: a, reps: b, weight: toKg(c, m[5]), pos });
    else groups.push({ weight: toKg(a, m[2]), sets: b, reps: c, pos });
  });
  // Repeticiones por serie: "10-10-6" → 3 series sueltas (mismo peso)
  const repLists: { reps: number[]; pos: number }[] = [];
  eat(/(\d+(?:\s*-\s*\d+)+)(?!\s*(?:kg|kilos?|k|lbs?|libras?)\b)/g, (m, pos) => {
    repLists.push({ reps: m[1].split("-").map((n) => +n.trim()), pos });
  });
  // "3 series de 10", "4 sets of 8"
  eat(/(\d+)\s*(?:series|serie|sets?)\s*(?:de|of|x)?\s*(\d+)\s*(?:repeticiones|repes|reps?)?/g, (m) => { sets = +m[1]; reps = +m[2]; });
  // A x B (luego decidimos si es peso×reps o series×reps)
  eat(new RegExp(`${NUM}\\s*${UNIT}?\\s*x\\s*(\\d+)(?!\\.\\d)`, "g"), (m, pos) => pairs.push({ a: +m[1], unitA: m[2], b: +m[3], pos }));
  eat(/(\d+)\s*(?:series|serie|sets?)\b/g, (m) => { sets = +m[1]; });
  eat(/(\d+)\s*(?:repeticiones|repes|reps?|veces)\b/g, (m) => { reps = +m[1]; });
  eat(new RegExp(`${NUM}\\s*${UNIT}\\b`, "g"), (m, pos) => weights.push({ v: toKg(+m[1], m[2]), pos, explicit: true }));
  eat(new RegExp(`${NUM}`, "g"), (m, pos) => weights.push({ v: +m[1], pos, explicit: false }));
  weights.sort((x, y) => x.pos - y.pos);

  const nearestWeight = (pos: number) =>
    weights.length ? weights.reduce((best, w) => (Math.abs(w.pos - pos) < Math.abs(best.pos - pos) ? w : best)).v : null;

  for (const p of pairs) {
    const weightByReps =
      !!p.unitA || (!weights.length && sets === null && (p.a > 12 || !Number.isInteger(p.a)));
    if (weightByReps) groups.push({ weight: toKg(p.a, p.unitA), sets: 1, reps: p.b, pos: p.pos });
    else groups.push({ weight: nearestWeight(p.pos), sets: p.a, reps: p.b, pos: p.pos });
  }

  for (const rl of repLists) {
    const w = nearestWeight(rl.pos);
    rl.reps.forEach((r, i) => groups.push({ weight: w, sets: 1, reps: r, pos: rl.pos + i * 0.01 }));
  }

  if (!groups.length && (sets !== null || reps !== null || weights.length)) {
    groups.push({ weight: weights[0]?.v ?? null, sets: sets ?? (reps !== null ? 1 : null), reps, pos: 0 });
  }

  // 80x5, 80x5, 80x5 → 3x5 @80
  groups.sort((x, y) => x.pos - y.pos);
  const merged: Group[] = [];
  for (const g of groups) {
    const last = merged[merged.length - 1];
    if (last && last.weight === g.weight && last.reps === g.reps && last.sets !== null && g.sets !== null) last.sets += g.sets;
    else merged.push({ ...g });
  }
  return merged;
}

function dayOffsetOf(text: string) {
  if (/\banteayer\b/.test(text)) return -2;
  if (/\b(ayer|yesterday)\b/.test(text)) return -1;
  return 0;
}

/**
 * Interpreta un mensaje del chat. Ejemplos que entiende:
 *  "press banca 80kg 3x10 y sentadilla 100 5x5"
 *  "ayer dominadas 4x8, peso muerto 140x5"
 *  "banca 60x10, 70x8, 80x6"        (una serie por peso)
 *  "militar 3 series de 8 con 42,5kg"
 *  "curl 3x12"                       (sin peso → usa el de la última vez)
 *  "récord en banca" · "deshacer" · "ayuda"
 */
export function parseWorkoutMessage(input: string, catalog: CatalogItem[], history: HistoryItem[] = []): ParseResult {
  let text = normalize(input).trim();
  // decimales con coma solo cuando van pegados a una unidad: "82,5kg" (no "60x10,70x8")
  text = text.replace(/(\d+),(\d{1,2})(?=\s*(?:kg|kilos?|k|lbs?|libras?)\b)/g, "$1.$2").replace(/\bpor\b/g, "x");

  if (/^(deshacer|deshaz|undo|borra(r)?( el)? ultimo|elimina(r)?( el)? ultimo)\b/.test(text)) return { intent: "undo" };
  if (/^(ayuda|help|\?|como funciona)/.test(text)) return { intent: "help" };

  const tokens = text.replace(/(\d)\s*-\s*(?=\d)/g, "$1-").split(/[^a-z0-9.+-]+/).filter(Boolean).map((t) => t.replace(/^[.-]+|[.-]+$/g, "")).filter(Boolean);
  const matches = findExercises(tokens, catalog);
  const hasNumbers = /\d/.test(text);

  if (!hasNumbers && /\b(record|pr|maximo|mejor|progreso|ultima vez|ultimo|cuanto|best)\b/.test(text)) {
    return { intent: "query", exercise: matches[0]?.name ?? null };
  }
  if (!hasNumbers && matches.length) return { intent: "query", exercise: matches[0].name };

  const dayOffset = dayOffsetOf(text);
  const entries: ParsedEntry[] = [];
  const incomplete: ParsedEntry[] = [];
  let unknownName: string | null = null;

  type Seg = { name: string; text: string };
  const segments: Seg[] = [];
  if (matches.length) {
    matches.forEach((m, i) => {
      const from = i === 0 ? 0 : m.end; // los números antes del primer ejercicio son suyos ("3x10 press militar 40")
      const to = matches[i + 1]?.start ?? tokens.length;
      const own = tokens.slice(m.end, to);
      const prefix = i === 0 ? tokens.slice(from, m.start).filter((t) => /\d/.test(t)) : [];
      segments.push({ name: m.name, text: [...prefix, ...own].join(" ") });
    });
  } else if (hasNumbers) {
    // Ejercicio desconocido: las palabras antes del primer número
    const stop = new Set(["hoy", "hice", "he", "hecho", "ayer", "anteayer", "today", "did", "y", "mas", "luego"]);
    const firstNum = tokens.findIndex((t) => /\d/.test(t));
    const words = tokens.slice(0, firstNum < 0 ? tokens.length : firstNum).filter((t) => /^[a-z]+$/.test(t) && !stop.has(t));
    if (words.length) {
      unknownName = words.slice(-4).join(" ");
      unknownName = unknownName.charAt(0).toUpperCase() + unknownName.slice(1);
      segments.push({ name: unknownName, text: tokens.slice(firstNum).join(" ") });
    }
  }

  for (const seg of segments) {
    const cat = catalog.find((c) => c.name === seg.name);
    const last = history
      .filter((h) => normalize(h.exercise) === normalize(seg.name))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    const groups = parseNumbers(seg.text);
    if (!groups.length) groups.push({ weight: null, sets: null, reps: null, pos: 0 });

    for (const g of groups) {
      const e: ParsedEntry = { exercise: seg.name, weight: g.weight, sets: g.sets, reps: g.reps, assumed: [] };
      if (e.reps === null || e.sets === null) {
        if (last) { e.sets = e.sets ?? last.sets; e.reps = e.reps ?? last.reps; e.assumed.push("setsreps"); }
      }
      if (e.weight === null) {
        if (cat?.bodyweight) e.weight = 0;
        else if (last) { e.weight = last.weight; e.assumed.push("weight"); }
      }
      const valid = e.weight !== null && e.sets !== null && e.reps !== null
        && e.weight <= 1000 && e.sets >= 1 && e.sets <= 50 && e.reps >= 1 && e.reps <= 500;
      (valid ? entries : incomplete).push(e);
    }
  }

  return { intent: "log", dayOffset, entries, incomplete, unknownName };
}

// ───────────────────────── rutina semanal ─────────────────────────

export type PlanItem = {
  exercise: string;           // nombre del catálogo
  sets: number;
  reps: [number, number] | "max";
  /** Peso objetivo de la próxima sesión, en `unit`; null = peso corporal */
  weight: number | null;
  unit: "kg" | "lb";
  /** Cómo se lee el peso: total, por lado de la barra/máquina, por mano o por pierna */
  per: "total" | "lado" | "mano" | "pierna";
  note?: string;
};
export type PlanBlock = { title: string; lines: string[] };
export type PlanDay = {
  dow: number;                // 1 = lunes … 7 = domingo
  title: string;
  kind: "gym" | "cardio" | "rest";
  items: PlanItem[];
  blocks?: PlanBlock[];       // días sin pesas: carrera, movilidad, core…
  note?: string;
};
export type GymPlan = { days: PlanDay[]; rules: string[] };

export const LB = 0.4536;
export const planWeightKg = (it: Pick<PlanItem, "weight" | "unit">) =>
  it.weight === null ? null : it.unit === "lb" ? roundTo(it.weight * LB, 0.5) : it.weight;
export const repsLabel = (it: Pick<PlanItem, "reps">) => (it.reps === "max" ? "máx" : `${it.reps[0]}-${it.reps[1]}`);
export const weightLabel = (it: Pick<PlanItem, "weight" | "unit" | "per">, es = true) =>
  it.weight === null
    ? (es ? "Peso corporal" : "Bodyweight")
    : `${formatKg(it.weight)} ${it.unit}${it.per === "total" ? "" : es ? ` por ${it.per}` : ` per ${({ lado: "side", mano: "hand", pierna: "leg" } as const)[it.per]}`}`;

/** Día de la semana 1-7 (lunes = 1) */
export const isoDow = (d = new Date()) => ((d.getDay() + 6) % 7) + 1;

export type Progress =
  | { status: "up"; next: number; last: string }   // completaste el tope del rango → sube
  | { status: "hold"; last: string }               // aún no: repite el peso
  | { status: "new" };                             // sin registros todavía

type LogLike = { exercise: string; weight: number; sets: number; reps: number; date: string | Date };
const dayOf = (d: string | Date) => new Date(d).toLocaleDateString("sv-SE");

/**
 * Regla de la rutina: "cuando completes el tope del rango en todas las series, sube 2.5 kg".
 * Mira la última sesión del ejercicio: si hay ≥ `sets` series con ≥ tope de reps al peso
 * objetivo (o más), propone el siguiente peso (+2.5 kg, o +5 lb en material en libras).
 */
export function progressFor(it: PlanItem, logs: LogLike[]): Progress {
  const mine = logs.filter((l) => normalize(l.exercise) === normalize(it.exercise));
  if (!mine.length) return { status: "new" };
  const lastDay = mine.reduce((a, l) => (dayOf(l.date) > a ? dayOf(l.date) : a), "");
  const session = mine.filter((l) => dayOf(l.date) === lastDay).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  // "10-10-6" o "4×8 @ 60"
  const flat = session.flatMap((l) => Array.from({ length: l.sets }, () => ({ w: l.weight, r: l.reps })));
  const last = flat.every((s) => s.w === flat[0].w)
    ? `${flat.map((s) => s.r).join("-")}${flat[0].w ? ` @ ${formatKg(flat[0].w)} kg` : ""}`
    : flat.map((s) => `${formatKg(s.w)}×${s.r}`).join(", ");
  if (it.reps === "max" || it.weight === null) return { status: "hold", last };
  const target = planWeightKg(it)!;
  const top = it.reps[1];
  const done = flat.filter((s) => s.w >= target - 0.5 && s.r >= top).length;
  if (done >= it.sets) return { status: "up", next: it.weight + (it.unit === "lb" ? 5 : 2.5), last };
  return { status: "hold", last };
}
