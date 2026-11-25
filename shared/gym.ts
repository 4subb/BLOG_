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

/** Familias de movimiento: los ejercicios de una misma familia son variantes entre sí */
export type Family =
  | "hpush" | "incline" | "fly" | "dip" | "vpush" | "lateral" | "reardelt"
  | "vpull" | "hpull" | "squat" | "lunge" | "hinge" | "glute" | "legcurl" | "legext" | "calf"
  | "biceps" | "triceps" | "core";

export type Equipment = "barra" | "mancuernas" | "maquina" | "polea" | "multipower" | "peso corporal" | "kettlebell";
export const EQUIPMENT_LABELS: Record<Equipment, { es: string; en: string }> = {
  barra: { es: "barra", en: "barbell" }, mancuernas: { es: "mancuernas", en: "dumbbells" }, maquina: { es: "máquina", en: "machine" },
  polea: { es: "polea", en: "cable" }, multipower: { es: "multipower", en: "smith machine" },
  "peso corporal": { es: "peso corporal", en: "bodyweight" }, kettlebell: { es: "kettlebell", en: "kettlebell" },
};

export type ExerciseDef = {
  name: string;
  muscleGroup: MuscleGroup;
  pattern: MovementPattern;
  aliases: string[];
  bodyweight?: boolean;
  family?: Family;
  equipment?: Equipment;
  /**
   * Carga típica relativa dentro de su familia (la referencia de barra = 1). Sirve para proponer
   * un peso de partida aproximado al cambiar de variante. Por mano si `perHand`.
   */
  load?: number;
  perHand?: boolean;
};

// Biblioteca de ejercicios conocidos: NO se copia a nadie. Sirve para sugerir nombre, grupo,
// animación y alias cuando un usuario añade un ejercicio a su propio catálogo (que empieza vacío).
export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // Pecho · press horizontal
  { name: "Press banca", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "barra", load: 1, aliases: ["banca", "press de banca", "press plano", "press banca plano", "banca plana", "press con barra", "bench", "bench press", "pb"] },
  { name: "Press con mancuernas", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "mancuernas", load: 0.4, perHand: true, aliases: ["press mancuernas", "press de banca con mancuernas", "banca con mancuernas", "banca mancuernas", "dumbbell press", "db press"] },
  { name: "Press en máquina", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "maquina", load: 0.9, aliases: ["press maquina", "press pecho maquina", "chest press", "press hammer", "hammer"] },
  { name: "Press banca en multipower", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "multipower", load: 0.85, aliases: ["banca multipower", "press multipower", "banca smith", "smith bench"] },
  { name: "Press declinado", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "barra", load: 0.95, aliases: ["declinado", "banca declinada", "decline press"] },
  { name: "Flexiones", muscleGroup: "pecho", pattern: "press", family: "hpush", equipment: "peso corporal", bodyweight: true, aliases: ["flexion", "lagartijas", "lagartija", "push up", "pushups", "pechadas"] },
  // Pecho · inclinado
  { name: "Press inclinado", muscleGroup: "pecho", pattern: "incline", family: "incline", equipment: "barra", load: 0.8, aliases: ["inclinado", "banca inclinada", "incline press", "press inclinado con barra"] },
  { name: "Press inclinado con mancuernas", muscleGroup: "pecho", pattern: "incline", family: "incline", equipment: "mancuernas", load: 0.33, perHand: true, aliases: ["inclinado mancuernas", "inclinado con mancuernas", "press inclinado mancuernas", "incline dumbbell press"] },
  { name: "Press inclinado en multipower", muscleGroup: "pecho", pattern: "incline", family: "incline", equipment: "multipower", load: 0.7, aliases: ["inclinado multipower", "inclinado smith"] },
  { name: "Press inclinado en máquina", muscleGroup: "pecho", pattern: "incline", family: "incline", equipment: "maquina", load: 0.75, aliases: ["inclinado maquina", "incline machine press"] },
  // Pecho · aperturas
  { name: "Fly con mancuerna", muscleGroup: "pecho", pattern: "press", family: "fly", equipment: "mancuernas", load: 1, perHand: true, aliases: ["fly", "flyes", "aperturas", "apertura con mancuerna", "fly mancuerna"] },
  { name: "Cruce de poleas", muscleGroup: "pecho", pattern: "press", family: "fly", equipment: "polea", load: 1, perHand: true, aliases: ["cruces", "cruce poleas", "cable crossover", "crossover", "aperturas en polea"] },
  { name: "Pec deck", muscleGroup: "pecho", pattern: "press", family: "fly", equipment: "maquina", load: 3, aliases: ["peck deck", "contractor", "mariposa", "aperturas en maquina", "butterfly"] },
  // Fondos
  { name: "Fondos", muscleGroup: "pecho", pattern: "dip", family: "dip", equipment: "peso corporal", bodyweight: true, aliases: ["fondo", "dips", "fondos en paralelas"] },
  { name: "Fondos en máquina", muscleGroup: "pecho", pattern: "dip", family: "dip", equipment: "maquina", aliases: ["fondos asistidos", "fondos maquina", "dip machine"] },
  { name: "Fondos en banco", muscleGroup: "brazos", pattern: "dip", family: "dip", equipment: "peso corporal", bodyweight: true, aliases: ["fondos banco", "bench dips"] },
  // Hombros
  { name: "Press militar", muscleGroup: "hombros", pattern: "overhead", family: "vpush", equipment: "barra", load: 1, aliases: ["militar", "press militar con barra", "press hombro", "ohp", "overhead press"] },
  { name: "Press de hombro con mancuernas", muscleGroup: "hombros", pattern: "overhead", family: "vpush", equipment: "mancuernas", load: 0.38, perHand: true, aliases: ["press hombro mancuernas", "militar con mancuernas", "militar mancuernas", "press militar con mancuernas", "hombro con mancuernas", "press sentado mancuernas", "dumbbell shoulder press"] },
  { name: "Press de hombro en máquina", muscleGroup: "hombros", pattern: "overhead", family: "vpush", equipment: "maquina", load: 0.85, aliases: ["press hombro maquina", "militar maquina", "shoulder press machine"] },
  { name: "Press Arnold", muscleGroup: "hombros", pattern: "overhead", family: "vpush", equipment: "mancuernas", load: 0.32, perHand: true, aliases: ["arnold", "arnold press"] },
  { name: "Elevación lateral", muscleGroup: "hombros", pattern: "raise", family: "lateral", equipment: "mancuernas", load: 1, perHand: true, aliases: ["elevaciones laterales", "laterales", "lateral", "lateral raise", "vuelos laterales"] },
  { name: "Elevación lateral en polea", muscleGroup: "hombros", pattern: "raise", family: "lateral", equipment: "polea", load: 0.7, perHand: true, aliases: ["lateral polea", "laterales en polea", "cable lateral raise"] },
  { name: "Elevación lateral en máquina", muscleGroup: "hombros", pattern: "raise", family: "lateral", equipment: "maquina", load: 2, aliases: ["lateral maquina", "laterales maquina"] },
  { name: "Apertura invertida", muscleGroup: "hombros", pattern: "raise", family: "reardelt", equipment: "mancuernas", load: 1, perHand: true, aliases: ["aperturas invertidas", "reverse fly", "pajaros", "pajaro", "deltoides posterior"] },
  { name: "Face pull", muscleGroup: "hombros", pattern: "row", family: "reardelt", equipment: "polea", load: 2.5, aliases: ["facepull", "face pulls", "jalon a la cara"] },
  { name: "Pec deck invertido", muscleGroup: "hombros", pattern: "raise", family: "reardelt", equipment: "maquina", load: 3, aliases: ["contractor invertido", "reverse pec deck", "mariposa invertida"] },
  { name: "Elevación frontal", muscleGroup: "hombros", pattern: "raise", family: "lateral", equipment: "mancuernas", load: 1, perHand: true, aliases: ["elevaciones frontales", "front raise", "frontales"] },
  { name: "Remo al mentón", muscleGroup: "hombros", pattern: "raise", family: "lateral", equipment: "barra", load: 2.5, aliases: ["upright row", "remo menton"] },
  { name: "Encogimientos de hombros", muscleGroup: "hombros", pattern: "raise", family: "reardelt", equipment: "mancuernas", load: 2.5, perHand: true, aliases: ["encogimiento de hombros", "encogimientos trapecio", "trapecio", "shrugs", "shrug"] },
  // Espalda · tirón vertical
  { name: "Dominadas", muscleGroup: "espalda", pattern: "pull", family: "vpull", equipment: "peso corporal", bodyweight: true, aliases: ["dominada", "dominadas estrictas", "pull up", "pullups", "chin up", "dom", "doms"] },
  { name: "Dominadas asistidas", muscleGroup: "espalda", pattern: "pull", family: "vpull", equipment: "maquina", aliases: ["dominadas en maquina", "dominadas con banda", "assisted pull up"] },
  { name: "Pulldown", muscleGroup: "espalda", pattern: "pull", family: "vpull", equipment: "polea", load: 1, aliases: ["jalon", "jalon al pecho", "polea al pecho", "lat pulldown"] },
  { name: "Jalón agarre estrecho", muscleGroup: "espalda", pattern: "pull", family: "vpull", equipment: "polea", load: 1, aliases: ["jalon estrecho", "jalon agarre cerrado", "close grip pulldown"] },
  { name: "Pullover", muscleGroup: "espalda", pattern: "pull", family: "vpull", equipment: "polea", load: 0.5, aliases: ["pull over", "pullover en polea", "jalon brazos rectos"] },
  // Espalda · remo
  { name: "Remo con barra", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "barra", load: 1, aliases: ["remo", "remo barra", "barbell row"] },
  { name: "Remo en banca al ombligo", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "mancuernas", load: 0.4, perHand: true, aliases: ["remo en banca", "remo banca", "remo al ombligo", "chest supported row"] },
  { name: "Remo con mancuerna", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "mancuernas", load: 0.45, perHand: true, aliases: ["remo mancuerna", "dumbbell row", "remo unilateral"] },
  { name: "Remo en polea baja", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "polea", load: 0.9, aliases: ["remo polea", "remo sentado", "remo gironda", "seated cable row"] },
  { name: "Remo en máquina", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "maquina", load: 0.9, aliases: ["remo maquina", "remo hammer", "machine row"] },
  { name: "Remo T", muscleGroup: "espalda", pattern: "row", family: "hpull", equipment: "barra", load: 0.8, aliases: ["remo en t", "t bar row", "remo landmine"] },
  // Brazos
  { name: "Curl de bíceps", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "mancuernas", load: 1, perHand: true, aliases: ["curl", "curl biceps", "biceps", "curl mancuerna", "bi", "bis"] },
  { name: "Curl martillo", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "mancuernas", load: 1.1, perHand: true, aliases: ["martillo", "hammer curl"] },
  { name: "Curl con barra", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "barra", load: 2.2, aliases: ["curl barra", "curl de biceps con barra", "curl biceps barra", "curl barra z", "curl con barra z", "barbell curl"] },
  { name: "Curl concentrado", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "mancuernas", load: 0.9, perHand: true, aliases: ["concentrado", "concentration curl"] },
  { name: "Curl inclinado", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "mancuernas", load: 0.85, perHand: true, aliases: ["curl en banco inclinado", "incline curl"] },
  { name: "Curl en polea", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "polea", load: 1.6, aliases: ["curl polea", "cable curl"] },
  { name: "Curl predicador", muscleGroup: "brazos", pattern: "curl", family: "biceps", equipment: "maquina", load: 1.5, aliases: ["predicador", "curl scott", "scott", "preacher curl"] },
  { name: "Extensión de tríceps en polea", muscleGroup: "brazos", pattern: "extension", family: "triceps", equipment: "polea", load: 1, aliases: ["triceps", "triceps polea", "extension de triceps", "extension triceps", "agarre v", "pushdown", "jalon triceps", "tri", "tris"] },
  { name: "Press francés", muscleGroup: "brazos", pattern: "extension", family: "triceps", equipment: "barra", load: 1, aliases: ["frances", "skull crusher", "rompecraneos"] },
  { name: "Press cerrado", muscleGroup: "brazos", pattern: "press", family: "triceps", equipment: "barra", load: 1.6, aliases: ["press agarre cerrado", "banca agarre cerrado", "banca cerrada", "close grip bench"] },
  { name: "Patada de tríceps", muscleGroup: "brazos", pattern: "extension", family: "triceps", equipment: "mancuernas", load: 0.3, perHand: true, aliases: ["patada triceps", "tricep kickback"] },
  { name: "Extensión de tríceps sobre la cabeza", muscleGroup: "brazos", pattern: "extension", family: "triceps", equipment: "mancuernas", load: 0.8, aliases: ["triceps sobre la cabeza", "extension tras nuca", "overhead triceps", "copa"] },
  // Piernas · sentadilla
  { name: "Sentadilla", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "barra", load: 1, aliases: ["sentadillas", "sentadilla barra libre", "sentadilla libre", "squat", "back squat", "sq"] },
  { name: "Sentadilla hack", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "maquina", load: 0.9, aliases: ["hack", "hack squat", "jaca"] },
  { name: "Sentadilla en multipower", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "multipower", load: 0.9, aliases: ["sentadilla smith", "sentadilla multipower"] },
  { name: "Sentadilla goblet", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "mancuernas", load: 0.3, aliases: ["goblet", "goblet squat", "sentadilla copa"] },
  { name: "Sentadilla frontal", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "barra", load: 0.8, aliases: ["frontal", "front squat"] },
  { name: "Sentadilla sumo", muscleGroup: "piernas", pattern: "squat", family: "squat", equipment: "mancuernas", load: 0.4, aliases: ["sumo squat", "sentadilla sumo con mancuerna"] },
  { name: "Prensa 90°", muscleGroup: "piernas", pattern: "legpress", family: "squat", equipment: "maquina", load: 1.8, aliases: ["prensa", "leg press", "prensa de piernas", "prensa inclinada"] },
  // Piernas · zancadas
  { name: "Sentadilla búlgara", muscleGroup: "piernas", pattern: "lunge", family: "lunge", equipment: "mancuernas", load: 1, perHand: true, aliases: ["bulgara", "bulgaras", "zancada bulgara", "zancadas bulgaras", "sentadillas bulgaras", "split squat"] },
  { name: "Zancadas caminando", muscleGroup: "piernas", pattern: "lunge", family: "lunge", equipment: "mancuernas", load: 1, perHand: true, aliases: ["zancadas", "zancada", "walking lunges", "lunges", "estocadas"] },
  { name: "Zancada inversa", muscleGroup: "piernas", pattern: "lunge", family: "lunge", equipment: "mancuernas", load: 1, perHand: true, aliases: ["zancadas inversas", "reverse lunge", "zancada atras"] },
  { name: "Step-up", muscleGroup: "piernas", pattern: "lunge", family: "lunge", equipment: "mancuernas", load: 0.9, perHand: true, aliases: ["step up", "subidas al cajon", "subida al banco"] },
  // Piernas · bisagra
  { name: "Peso muerto rumano", muscleGroup: "piernas", pattern: "hinge", family: "hinge", equipment: "barra", load: 1, aliases: ["rumano", "rdl", "peso muerto", "romanian deadlift", "pmr"] },
  { name: "Peso muerto rumano con mancuernas", muscleGroup: "piernas", pattern: "hinge", family: "hinge", equipment: "mancuernas", load: 0.4, perHand: true, aliases: ["rumano mancuernas", "rdl mancuernas", "dumbbell rdl"] },
  { name: "Peso muerto convencional", muscleGroup: "espalda", pattern: "hinge", family: "hinge", equipment: "barra", load: 1.25, aliases: ["peso muerto", "deadlift", "pm"] },
  { name: "Peso muerto sumo", muscleGroup: "piernas", pattern: "hinge", family: "hinge", equipment: "barra", load: 1.25, aliases: ["sumo deadlift", "pm sumo"] },
  { name: "Buenos días", muscleGroup: "piernas", pattern: "hinge", family: "hinge", equipment: "barra", load: 0.5, aliases: ["buenos dias", "good morning"] },
  { name: "Hiperextensiones", muscleGroup: "espalda", pattern: "hinge", family: "hinge", equipment: "peso corporal", bodyweight: true, aliases: ["hiperextension", "extensiones lumbares", "back extension", "banco romano"] },
  // Glúteo
  { name: "Hip thrust", muscleGroup: "piernas", pattern: "hinge", family: "glute", equipment: "barra", load: 1, aliases: ["empuje de cadera", "hip", "hip trust"] },
  { name: "Puente de glúteo", muscleGroup: "piernas", pattern: "hinge", family: "glute", equipment: "barra", load: 0.8, aliases: ["puente de gluteo", "glute bridge", "puente"] },
  { name: "Patada de glúteo en polea", muscleGroup: "piernas", pattern: "hinge", family: "glute", equipment: "polea", load: 0.2, aliases: ["patada de gluteo", "patada polea", "glute kickback"] },
  { name: "Abductores", muscleGroup: "piernas", pattern: "legext", family: "glute", equipment: "maquina", load: 0.6, aliases: ["abductor", "abductores en maquina", "hip abduction"] },
  { name: "Aductores", muscleGroup: "piernas", pattern: "legext", family: "glute", equipment: "maquina", load: 0.6, aliases: ["aductor", "aductores en maquina", "hip adduction"] },
  // Femoral / cuádriceps / gemelo
  { name: "Curl femoral unilateral", muscleGroup: "piernas", pattern: "legcurl", family: "legcurl", equipment: "maquina", load: 0.5, aliases: ["curl femoral", "femoral", "femoral unilateral", "leg curl"] },
  { name: "Curl femoral tumbado", muscleGroup: "piernas", pattern: "legcurl", family: "legcurl", equipment: "maquina", load: 1, aliases: ["femoral tumbado", "lying leg curl", "curl femoral acostado"] },
  { name: "Curl femoral sentado", muscleGroup: "piernas", pattern: "legcurl", family: "legcurl", equipment: "maquina", load: 1.1, aliases: ["femoral sentado", "seated leg curl"] },
  { name: "Curl nórdico", muscleGroup: "piernas", pattern: "legcurl", family: "legcurl", equipment: "peso corporal", bodyweight: true, aliases: ["nordico", "nordicos", "nordic curl"] },
  { name: "Extensión de cuádriceps", muscleGroup: "piernas", pattern: "legext", family: "legext", equipment: "maquina", load: 1, aliases: ["extension de cuadriceps", "extension cuadriceps", "cuadriceps", "extensiones", "extension de pierna", "extensiones de pierna", "leg extension", "cuads"] },
  { name: "Extensión de cuádriceps unilateral", muscleGroup: "piernas", pattern: "legext", family: "legext", equipment: "maquina", load: 0.5, aliases: ["extension unilateral", "cuadriceps unilateral"] },
  { name: "Sissy squat", muscleGroup: "piernas", pattern: "squat", family: "legext", equipment: "peso corporal", bodyweight: true, aliases: ["sissy", "sentadilla sissy"] },
  { name: "Pantorrilla sentado", muscleGroup: "piernas", pattern: "calf", family: "calf", equipment: "maquina", load: 1, aliases: ["pantorrilla", "pantorrillas", "gemelos", "soleo", "calf raise"] },
  { name: "Pantorrilla de pie", muscleGroup: "piernas", pattern: "calf", family: "calf", equipment: "maquina", load: 1.3, aliases: ["gemelo de pie", "pantorrilla parado", "standing calf raise"] },
  { name: "Pantorrilla en prensa", muscleGroup: "piernas", pattern: "calf", family: "calf", equipment: "maquina", load: 1.5, aliases: ["gemelo en prensa", "calf press"] },
  // Core
  { name: "Abdominales", muscleGroup: "core", pattern: "core", family: "core", equipment: "peso corporal", bodyweight: true, aliases: ["abs", "crunch", "crunches", "encogimientos", "abdominal"] },
  { name: "Plancha", muscleGroup: "core", pattern: "core", family: "core", equipment: "peso corporal", bodyweight: true, aliases: ["planchas", "plank"] },
  { name: "Rueda abdominal", muscleGroup: "core", pattern: "core", family: "core", equipment: "peso corporal", bodyweight: true, aliases: ["rueda", "ab wheel", "rollout"] },
  { name: "Elevación de piernas colgado", muscleGroup: "core", pattern: "core", family: "core", equipment: "peso corporal", bodyweight: true, aliases: ["elevacion de piernas", "hanging leg raise", "elevaciones de piernas"] },
  { name: "Crunch en polea", muscleGroup: "core", pattern: "core", family: "core", equipment: "polea", aliases: ["crunch polea", "cable crunch", "abdominal en polea"] },
];

/** Busca en la biblioteca por nombre o, si no, por alias (sin acentos ni mayúsculas) */
export const findInLibrary = (name: string) => {
  const n = normalize(name.trim());
  if (!n) return undefined;
  return EXERCISE_LIBRARY.find((e) => normalize(e.name) === n) ?? EXERCISE_LIBRARY.find((e) => e.aliases.some((a) => normalize(a) === n));
};

// Palabras que no cambian de ejercicio ("sentadilla normal en barra libre" = "sentadilla")
const NEUTRAL = new Set(["libre", "libres", "olimpica", "olimpico", "normal", "normales", "clasica", "clasico", "tradicional", "trasera", "regular", "estandar"]);
const EQUIP_WORDS: Record<string, Equipment> = {
  barra: "barra", barras: "barra", bara: "barra", barbell: "barra",
  mancuerna: "mancuernas", mancuernas: "mancuernas", mancuerda: "mancuernas", mancuerdas: "mancuernas", dumbbell: "mancuernas", dumbbells: "mancuernas",
  maquina: "maquina", maquinas: "maquina", machine: "maquina",
  polea: "polea", poleas: "polea", cable: "polea", cables: "polea",
  smith: "multipower", multipower: "multipower",
};

const keyWords = (s: string) => normalize(s).split(/[^a-z0-9°]+/).filter((w) => w && !FILLER.has(w));
const keyCache = new Map<string, string>();
/**
 * Identidad de un ejercicio: dos nombres con la misma clave son el mismo ("Sentadilla", "sentadilla en
 * barra libre", "Squat"). Solo se ignora el material si es el habitual de ese ejercicio: "press banca con
 * barra" = "press banca", pero "curl con barra" ≠ "curl de bíceps" (mancuernas).
 */
export function exerciseKey(name: string): string {
  const hit = keyCache.get(name);
  if (hit !== undefined) return hit;
  let def = findInLibrary(name);
  const words = keyWords(name).filter((w) => !NEUTRAL.has(w));
  if (!def) {
    const core = words.filter((w) => !(w in EQUIP_WORDS));
    const equip = Array.from(new Set(words.flatMap((w) => EQUIP_WORDS[w] ?? [])));
    const lookup = (ws: string[], ok: (e: ExerciseDef) => boolean) =>
      ws.length ? EXERCISE_LIBRARY.find((e) => ok(e) && [e.name, ...e.aliases].some((f) => keyWords(f).join(" ") === ws.join(" "))) : undefined;
    def = lookup(words, () => true) ?? (equip.length === 1 ? lookup(core, (e) => e.equipment === equip[0]) : undefined);
  }
  const key = def ? normalize(def.name) : words.map((w) => (w.length > 4 ? w.replace(/s$/, "") : w)).join(" ") || normalize(name).trim();
  if (keyCache.size > 2000) keyCache.clear();
  keyCache.set(name, key);
  return key;
}
export const sameExercise = (a: string, b: string) => a === b || exerciseKey(a) === exerciseKey(b);

// ───────────────────────── utilidades ─────────────────────────

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[×*]/g, "x");

export const roundTo = (n: number, step = 0.25) => Math.round(n / step) * step;

/** 1RM estimado (Epley). Con 1 repetición es el propio peso. */
export const estimate1RM = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export const formatKg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));

export type Unit = "kg" | "lb";
const KG_PER_LB = 0.45359237;
/** kg → unidad de visualización (kg a 0.25, lb a 0.5) */
export const fromKg = (kg: number, unit: Unit) => (unit === "lb" ? roundTo(kg / KG_PER_LB, 0.5) : roundTo(kg, 0.25));
/** Valor en `unit` → kg con precisión (se guarda así: 135 lb vuelve a mostrarse como 135 lb) */
export const toKgFrom = (v: number, unit: Unit) => (unit === "lb" ? Math.round(v * KG_PER_LB * 100) / 100 : v);
/** "61.25 kg" / "135 lb" */
export const fmtW = (kg: number, unit: Unit) => `${formatKg(fromKg(kg, unit))} ${unit}`;
/** Convierte un peso entre unidades redondeando a algo cargable (kg a 0.5, lb a 2.5) */
export const convertWeight = (v: number, from: Unit, to: Unit) =>
  from === to ? v : to === "lb" ? roundTo(v / KG_PER_LB, 2.5) : roundTo(v * KG_PER_LB, 0.5);

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
// Palabras corrientes que no son erratas de otro ejercicio ("plano" no es "plank")
const NOT_TYPO = new Set(["plano", "plana", "planos", "planas", "prensa", "press", "pesos", "peso", "pierna", "piernas", "barra", "banco", "hombro", "hombros", "lado", "lados"]);
function wordMatches(token: string, word: string, prefix = false) {
  if (token === word) return true;
  if (!/^[a-z]+$/.test(token) || NOT_TYPO.has(token)) return false;
  // Abreviatura: "sent" → sentadilla, "domi" → dominadas (solo en la 2.ª pasada)
  if (prefix && token.length >= 4 && word.startsWith(token)) return true;
  if (word.length < 5) return false;
  return lev(token, word) <= (word.length >= 9 ? 2 : 1);
}

const JOIN = new Set(["y", "e", "mas", "luego", "despues", "and", "then", "+"]);
const FILLER = new Set(["de", "del", "en", "la", "el", "al", "con"]);

// ───────────────────────── analizador ─────────────────────────

export type CatalogItem = {
  name: string; aliases: string[]; bodyweight: boolean;
  /** Está en la rutina de hoy */
  today?: boolean;
  /** Lo hace con otro material que el habitual (p. ej. apertura invertida en máquina): no cambiar de ejercicio por el material */
  anyEquipment?: boolean;
};
export type HistoryItem = { exercise: string; weight: number; sets: number; reps: number; date: string | Date };

export type ParsedEntry = {
  exercise: string;
  weight: number | null;
  sets: number | null;
  reps: number | null;
  /** Campos que no venían en el mensaje y se tomaron de la última sesión */
  assumed: Array<"weight" | "setsreps">;
  /** Ejercicio de la rutina al que sustituye ("press mancuernas en vez de banca") */
  variantOf?: string;
};

export type ParseResult =
  | { intent: "undo" }
  | { intent: "redo" }
  | { intent: "start"; exercise: string }         // "hoy sentadilla en barra libre": pasa a ser el ejercicio en curso
  /** "no, era sentadilla" · "eran 70kg": corrige lo último registrado */
  | { intent: "fix"; exercise: string | null; weight: number | null; sets: number | null; reps: number | null }
  | { intent: "help" }
  | { intent: "finish" }                          // "terminé", "rutina completa"
  | { intent: "done"; exercise: string }          // "remo listo", "ya completé dominadas"
  | { intent: "query"; exercise: string | null }
  | { intent: "variants"; exercise: string | null }                 // "alternativas a banca", "máquina ocupada"
  | { intent: "convert"; value: number; from: Unit; to: Unit }      // "135 lb a kg"
  | {
      intent: "log";
      dayOffset: number; // 0 = hoy, -1 = ayer...
      entries: ParsedEntry[];
      /** Entradas a las que les falta algo y no hay historial para suponerlo */
      incomplete: ParsedEntry[];
      /** Nombre que parece un ejercicio pero no está en el catálogo */
      unknownName: string | null;
      /** Si es una variante: el ejercicio original */
      variantOf: string | null;
    };

type Match = { start: number; end: number; name: string };

function findExercises(tokens: string[], catalog: CatalogItem[]): Match[] {
  // Todas las formas (nombre + alias) en palabras, de más larga a más corta: gana "peso muerto rumano"
  const forms = catalog
    .flatMap((c) => [c.name, ...c.aliases].map((f) => ({ words: normalize(f).split(/[^a-z]+/).filter(Boolean), name: c.name })))
    .filter((f) => f.words.length)
    .sort((a, b) => b.words.length - a.words.length);

  const tryAt = (i: number, prefix: boolean): Match | null => {
    // A igual longitud gana la coincidencia sin erratas ("press inclinado" no es "press declinado")
    let best: (Match & { len: number }) | null = null;
    for (const f of forms) {
      if (best && f.words.length < best.len) break;
      let t = i, w = 0, exact = true;
      while (w < f.words.length && t < tokens.length) {
        if (wordMatches(tokens[t], f.words[w], prefix)) { if (tokens[t] !== f.words[w]) exact = false; t++; w++; }
        else if (w > 0 && FILLER.has(tokens[t])) t++; // "press de banca" ≈ "press banca"
        else break;
      }
      if (w === f.words.length) {
        if (exact) return { start: i, end: t, name: f.name };
        best ??= { start: i, end: t, name: f.name, len: w };
      }
    }
    return best;
  };
  const out: Match[] = [];
  let i = 0;
  while (i < tokens.length) {
    const hit = tryAt(i, false) ?? tryAt(i, true);
    if (!hit) { i++; continue; }
    i = hit.end;
    // Dos nombres seguidos sin números ni "y" en medio hablan del mismo ejercicio: gana el más específico
    const prev = out[out.length - 1];
    if (prev && !tokens.slice(prev.end, hit.start).some((t) => /\d/.test(t) || JOIN.has(t))) {
      const longer = hit.end - hit.start > prev.end - prev.start;
      out[out.length - 1] = { start: prev.start, end: hit.end, name: longer ? hit.name : prev.name };
    } else out.push(hit);
  }
  // Mismo ejercicio con otro nombre en el catálogo → el primero (rutina de hoy, luego propios, luego biblioteca)
  return out.map((m) => ({ ...m, name: catalog.find((c) => sameExercise(c.name, m.name))?.name ?? m.name }));
}

/** "press militar … con mancuernas" → el ejercicio de esa familia con ese material (solo desde el ejercicio base) */
function byEquipment(name: string, words: string[], catalog: CatalogItem[]): string {
  const cat = catalog.find((c) => c.name === name);
  const def = EXERCISE_LIBRARY.find((e) => sameExercise(e.name, name));
  const said = Array.from(new Set(words.flatMap((w) => EQUIP_WORDS[w] ?? [])));
  if (!def?.equipment || cat?.anyEquipment || said.length !== 1 || said[0] === def.equipment) return name;
  if (def.equipment === "polea" && said[0] === "barra") return name; // la barra es el agarre de la polea
  const family = EXERCISE_LIBRARY.filter((e) => e.family === def.family && e.pattern === def.pattern);
  if (family[0] !== def) return name;
  const other = family.find((e) => e.equipment === said[0]);
  return other ? catalog.find((c) => sameExercise(c.name, other.name))?.name ?? other.name : name;
}

// Formas abreviadas o mal escritas → forma canónica que entienden las expresiones de abajo
const ABBR: Record<string, string> = {
  rep: "reps", reps: "reps", rp: "reps", rps: "reps", repe: "reps", repes: "reps", repet: "reps", repts: "reps",
  repeticion: "reps", repeticiones: "reps", r: "reps", veces: "reps", rpt: "reps",
  ser: "series", sers: "series", seri: "series", seris: "series", serie: "series", series: "series", st: "series", sts: "series", set: "series", sets: "series",
  kg: "kg", kgs: "kg", kilo: "kg", kilos: "kg", kilogramo: "kg", kilogramos: "kg", kl: "kg", kls: "kg", kgr: "kg", kgrs: "kg", kgms: "kg",
  lb: "lb", lbs: "lb", lib: "lb", libs: "lb", libra: "lb", libras: "lb", lbr: "lb", lbrs: "lb", lbz: "lb", pound: "lb", pounds: "lb", lbras: "lb",
  prim: "primera", sgda: "segunda", terc: "tercera", cuar: "cuarta", ult: "ultima",
};
// Palabras largas a las que se corrige una errata ("repeticones", "segnda", "termne")
const FUZZY = [
  "series", "repeticiones", "kilos", "kilogramos", "libras", "primera", "segunda", "tercera", "cuarta", "quinta", "ultima",
  "termine", "terminado", "terminada", "listo", "rutina", "record", "deshacer", "variante", "variantes", "alternativa",
  "alternativas", "ocupada", "ocupado", "anteayer", "convierte", "convertir", "maquina", "mancuernas", "siguiente",
];
const NUM_WORDS: Record<string, number> = {
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13,
  catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veinticinco: 25, treinta: 30,
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

/** Corrige vocabulario del chat sin tocar palabras que forman parte de nombres de ejercicios */
export function canonicalize(text: string, protectedWords: Set<string> = new Set()): string {
  let t = text
    .replace(/\b\d{1,2}\s?(?:ra|da|ta|era|er|na|ma|va|ª|º|°)\b/g, " ")   // ordinales "1ra", "2da": solo numeran
    .replace(/(\d)([a-z])/g, "$1 $2").replace(/([a-z])(\d)/g, "$1 $2")   // "135lbs" → "135 lbs"
    .replace(/(\d) (ra|da|ta|era|er|na|ma|va|a|o) (serie|set|ser|seri)/g, "$1$2 $3")   // "2 da serie" → "2da serie"
    .replace(/\b(una?|uno|one)\s+(serie|set|ser)/g, "1 $2");
  t = t.replace(/[a-z]+/g, (w) => {
    if (protectedWords.has(w)) return w;
    if (w in ABBR) return ABBR[w];
    if (w in NUM_WORDS) return String(NUM_WORDS[w]);
    if (w.length >= 5) {
      const f = FUZZY.find((c) => Math.abs(c.length - w.length) <= 2 && lev(w, c) <= (c.length >= 9 ? 2 : 1));
      if (f) return ABBR[f] ?? f;
    }
    return w;
  });
  return t.replace(/(\d)\s*x\s*(\d)/g, "$1x$2");
}

const UNIT = "(kg|kgs|kilos?|k|lbs?|libras?)";
const NUM = "(\\d+(?:\\.\\d+)?)";
// Unidad por defecto para números sin unidad (preferencia del usuario); se fija en cada parseWorkoutMessage
let defaultUnit: Unit = "kg";
const toKg = (n: number, unit?: string) => {
  const u: Unit = unit ? (/^(lb|libra)/.test(unit) ? "lb" : "kg") : defaultUnit;
  return toKgFrom(n, u);
};

type Group = { weight: number | null; sets: number | null; reps: number | null; pos: number; bare?: boolean; raw?: number };

/**
 * Extrae series/repeticiones/peso de un trozo de texto que habla de UN ejercicio.
 * `repsFirst`: los números sueltos son repeticiones (serie a serie, o ejercicios de peso corporal).
 */
export function parseNumbers(segment: string, repsFirst = false): Group[] {
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
  const repsSeen: { v: number; pos: number }[] = [];

  // 80x3x10  ·  3x10x80kg
  eat(new RegExp(`${NUM}\\s*${UNIT}?\\s*x\\s*(\\d+)\\s*x\\s*${NUM}\\s*${UNIT}?`, "g"), (m, pos) => {
    const a = +m[1], b = +m[3], c = +m[4];
    if (m[5] || (!m[2] && a <= 12 && c > 20 * (defaultUnit === "lb" ? 2 : 1))) groups.push({ sets: a, reps: b, weight: toKg(c, m[5]), pos });
    else groups.push({ weight: toKg(a, m[2]), sets: b, reps: c, pos });
  });
  // Repeticiones por serie: "10-10-6" → 3 series sueltas (mismo peso)
  const repLists: { reps: number[]; pos: number }[] = [];
  eat(/(\d+(?:\s*-\s*\d+)+)(?!\s*(?:kg|kilos?|k|lbs?|libras?)\b)/g, (m, pos) => {
    repLists.push({ reps: m[1].split("-").map((n) => +n.trim()), pos });
  });
  // "4 series 6 8 7 8" → repeticiones de cada serie; "3 series 8 70" → 3×8 con 70
  eat(/(\d+)\s*series\s*(?:de\s*)?((?:\d+\s+)+\d+)(?![\d.])(?!\s*(?:kg|lb|x|series|reps))/g, (m, pos) => {
    const list = m[2].trim().split(/\s+/).map(Number);
    if (list.length === 2 && +m[1] !== 2) { sets = +m[1]; reps = list[0]; weights.push({ v: toKg(list[1]), pos, explicit: false }); }
    else repLists.push({ reps: list, pos });
  });
  // "3 series de 10", "4 sets of 8"
  eat(/(\d+)\s*(?:series|serie|sets?)\s*(?:de|of|x)?\s*(\d+)\s*(?:repeticiones|repes|reps?)?/g, (m) => { sets = +m[1]; reps = +m[2]; });
  // A x B (luego decidimos si es peso×reps o series×reps)
  eat(new RegExp(`${NUM}\\s*${UNIT}?\\s*x\\s*(\\d+)(?!\\.\\d)`, "g"), (m, pos) => pairs.push({ a: +m[1], unitA: m[2], b: +m[3], pos }));
  eat(/(\d+)\s*(?:series|serie|sets?)\b/g, (m) => { sets = +m[1]; });
  eat(/(\d+)\s*(?:repeticiones|repes|reps?|veces)\b/g, (m, pos) => { reps = +m[1]; repsSeen.push({ v: +m[1], pos }); });
  eat(new RegExp(`${NUM}\\s*${UNIT}\\b`, "g"), (m, pos) => weights.push({ v: toKg(+m[1], m[2]), pos, explicit: true }));
  // "con 60", "@60" → peso aunque no lleve unidad
  eat(new RegExp(`(?:\\bcon|@)\\s*${NUM}`, "g"), (m, pos) => weights.push({ v: toKg(+m[1]), pos, explicit: true }));
  const bare: { v: number; pos: number }[] = [];
  eat(new RegExp(`${NUM}`, "g"), (m, pos) => bare.push({ v: +m[1], pos }));

  // Números sueltos: ¿peso o repeticiones?
  const structured = groups.length || pairs.length || repLists.length || sets !== null || reps !== null;
  if (bare.length && !structured) {
    const max = Math.max(...bare.map((b) => b.v));
    const others = bare.filter((b) => b.v !== max);
    if (repsFirst || weights.length) {
      // "8 7 6 6" → una serie por número
      repLists.push({ reps: bare.map((b) => b.v), pos: bare[0].pos });
    } else if (bare.length === 1) {
      groups.push({ weight: toKg(bare[0].v), sets: null, reps: null, pos: bare[0].pos, bare: true, raw: bare[0].v }); // se decide con el historial
    } else if (max > (defaultUnit === "lb" ? 66 : 30) || (others.length && max >= 2 * Math.max(...others.map((b) => b.v)))) {
      // "banca 60 8 7 6" → 60 kg; 8, 7, 6 reps
      const wi = bare.findIndex((b) => b.v === max);
      weights.push({ v: toKg(max), pos: bare[wi].pos, explicit: false });
      repLists.push({ reps: bare.filter((_, i) => i !== wi).map((b) => b.v), pos: bare[0].pos });
    } else {
      repLists.push({ reps: bare.map((b) => b.v), pos: bare[0].pos });
    }
  } else {
    for (const b of bare) weights.push({ v: toKg(b.v), pos: b.pos, explicit: false });
  }
  weights.sort((x, y) => x.pos - y.pos);

  const nearestWeight = (pos: number) =>
    weights.length ? weights.reduce((best, w) => (Math.abs(w.pos - pos) < Math.abs(best.pos - pos) ? w : best)).v : null;

  // "8 reps 70kg 7 reps 70kg" → una serie por cada una, con su peso
  if (repsSeen.length > 1 && sets === null) {
    repsSeen.forEach((r, i) => groups.push({
      weight: weights.length === repsSeen.length ? weights[i].v : nearestWeight(r.pos), sets: 1, reps: r.v, pos: r.pos,
    }));
  }

  for (const p of pairs) {
    const weightByReps =
      !!p.unitA || (!weights.length && sets === null && (p.a > 12 || !Number.isInteger(p.a)));
    // pares sin unidad: el peso va en la unidad por defecto
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

/** Ejercicios del catálogo que se parecen a un nombre desconocido (comparten alguna palabra, con erratas) */
export function suggestExercises(name: string, catalog: CatalogItem[], max = 4): string[] {
  const useful = (f: string) => normalize(f).split(/[^a-z]+/).filter((w) => w.length > 2 && !FILLER.has(w) && !NEUTRAL.has(w));
  const words = useful(name);
  return catalog
    .map((c, i) => {
      const score = Math.max(...[c.name, ...c.aliases].map((f) => {
        const fw = useful(f);
        const hits = words.filter((w) => fw.some((x) => wordMatches(w, x, true)));
        // el material solo no basta: "algo en barra" no sugiere todo lo de barra
        return hits.some((w) => !(w in EQUIP_WORDS)) ? hits.length / Math.max(words.length, fw.length) : 0;
      }));
      return { name: c.name, score: score + (c.today && score ? 0.3 : 0), i };
    })
    .filter((x) => x.score > 0.25)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, max)
    .map((x) => x.name);
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
const STOP = new Set([
  "hoy", "hice", "hize", "he", "hecho", "ayer", "anteayer", "today", "did", "y", "e", "mas", "luego", "ahora", "despues",
  "serie", "series", "set", "sets", "primera", "primer", "segunda", "tercera", "tercer", "cuarta", "quinta", "sexta",
  "ultima", "otra", "siguiente", "salieron", "salio", "sali", "logre", "saque", "reps", "rep", "repeticiones", "repes",
  "con", "de", "la", "el", "en", "me", "a", "al", "las", "los", "fueron", "fue", "then", "and", "first", "second",
  "third", "fourth", "fifth", "last", "another", "next", "kg", "kilos", "lb", "lbs", "x", "hoy", "variante", "como",
  "pero", "porque", "ya", "un", "una", "mi", "tambien", "unas", "unos", "hize", "hize",
]);

/**
 * `context`: ejercicio en curso (el último registrado). Si el mensaje no nombra ninguno
 * ("segunda serie 7", "8 7 6"), los números son series de ese ejercicio.
 */
export function parseWorkoutMessage(
  input: string, catalog: CatalogItem[], history: HistoryItem[] = [], context: string | null = null, unit: Unit = "kg",
): ParseResult {
  defaultUnit = unit;
  const protectedWords = new Set(catalog.flatMap((c) => [c.name, ...c.aliases]).flatMap((f) => normalize(f).split(/[^a-z]+/)).filter((w) => w.length > 1));
  // "set"/"series"/"reps" no son ejercicio aunque algún alias las use
  for (const w of ["series", "serie", "set", "sets", "reps", "rep", "kg", "lb", "lbs"]) protectedWords.delete(w);
  let text = canonicalize(normalize(input).trim(), protectedWords);
  // decimales con coma solo cuando van pegados a una unidad: "82,5kg" (no "60x10,70x8")
  text = text.replace(/(\d+),(\d{1,2})(?=\s*(?:kg|kilos?|k|lbs?|libras?)\b)/g, "$1.$2").replace(/\bpor\b/g, "x");
  // Coma decimal sin unidad: "72,5 4x8", "3x15 7,5" (nunca "8,7,6" ni "60x10,70x8")
  text = text.replace(/(^|\s)(\d{1,3}),(5|25|75)(?=\s+\d+\s*x\s*\d)/g, "$1$2.$3")
    .replace(/(x\s*\d+\s+(?:con\s+)?)(\d{1,3}),(5|25|75)(?=\s*(?:$|[a-z]))/g, "$1$2.$3")
    .replace(/(^|\s)([2-9]\d|1\d\d),(5|25|75)(?=\s|$)/g, "$1$2.$3")
    .replace(/\b\d+\s*(?:grados|°)/g, " ")
    .replace(/\s*[,;]\s*(?=[a-z])/g, " y "); // "banca 60x8, sentadilla 70x8": separa ejercicios
  // Series numeradas: "1 series 8 reps … 2 series 7 reps" / "series 1 8 … series 2 7" → el 1, 2, 3 solo numera
  const numbered = (re: RegExp) => {
    const ns = Array.from(text.matchAll(re)).map((m) => +m[1]);
    if (ns.length > 1 && ns.every((n, i) => n === i + 1)) text = text.replace(re, " ");
  };
  numbered(/\b(\d+) series (?=(?:de )?\d+)/g);
  numbered(/\bseries (\d+)\s*(?:[:=-]|de)?\s+(?=\d)/g);
  // Ordinales de serie: "1ra serie", "2ª serie", "serie 3:" → solo numeran, no son datos
  text = text
    .replace(/\b\d+\s*(?:ra|da|ta|era|er|na|ma|va|a|o|ª|º|°)\s*(?:series?|sets?)\b/g, " ")
    .replace(/\b(?:series?|sets?)\s*(?:#|n[oº°]?\.?)?\s*\d+\s*[:=]/g, " ");

  if (/^(deshacer|deshaz|undo|borra(r)?( el)? ultimo|elimina(r)?( el)? ultimo|quita(r)?( el)? ultimo)\b/.test(text)) return { intent: "undo" };
  if (/^(rehacer|rehaz|redo|restaurar|restaura|recuperar|recupera)\b/.test(text)) return { intent: "redo" };
  if (/^(ayuda|help|\?|como funciona)/.test(text)) return { intent: "help" };

  // Conversión: "135 lb a kg", "cuanto es 60 kg en libras", "convierte 100 lb"
  const conv = text.match(/^(?:cuanto (?:es|son)|convierte|convertir|pasa|pasame|cuantos? (?:kg|lb) (?:es|son))?\s*(\d+(?:[.,]\d+)?)\s*(kg|lb)\s*(?:(?:a|en|to|=|in)\s*(kg|lb))?\s*\??$/);
  if (conv && (conv[3] || /^(cuanto|convier|convertir|pasa)/.test(text))) {
    const from = conv[2] as Unit;
    return { intent: "convert", value: +conv[1].replace(",", "."), from, to: (conv[3] as Unit) ?? (from === "kg" ? "lb" : "kg") };
  }

  let tokens = text.replace(/(\d)\s*-\s*(?=\d)/g, "$1-").split(/[^a-z0-9.+-]+/).filter(Boolean).map((t) => t.replace(/^[.-]+|[.-]+$/g, "")).filter(Boolean);
  let matches = findExercises(tokens, catalog);
  const hasNumbers = /\d/.test(text);

  // Corrección de lo último: "no, era sentadilla", "perdón, eran 70kg", "corrige 4x8"
  if (/^(?:(?:no|perdon|ups)\s+(?:y\s+)?)*(?:era|eran|fue|fueron|quise decir|queria decir|corrige|corregir|corrijo|me equivoque)\b/.test(text)) {
    const ex = matches[0] ? byEquipment(matches[0].name, tokens, catalog) : null;
    const nums = parseNumbers(tokens.filter((_, i) => !matches.some((m) => i >= m.start && i < m.end)).join(" "));
    // Un número suelto sin unidad no dice si es peso o repeticiones: no se toca
    const g = nums.length === 1 && !nums[0].bare ? nums[0] : null;
    // "eran 8 reps" no dice cuántas series: se conservan
    const saysSets = !!g && ((g.sets ?? 0) > 1 || /\b1\s?x|series/.test(text));
    if (ex || g) return { intent: "fix", exercise: ex, weight: g?.weight ?? null, sets: saysSets ? g!.sets : null, reps: g?.reps ?? null };
  }

  // Variante: "press mancuernas 30 3x10 en vez de banca", "en lugar de banca hice ...", "variante de banca: ..."
  let variantOf: string | null = null;
  const marker = /\b(en vez de?l?|envez de?l?|en lugar de?l?|instead of|como variante de?l?|variante de?l?|sustituyendo|reemplazando|cambiando)\b/.exec(text);
  if (marker && hasNumbers) {
    const before = text.slice(0, marker.index).split(/[^a-z0-9.+-]+/).filter(Boolean).length;
    // el ejercicio original es el primero que aparece justo después del marcador
    const markerWords = marker[0].split(" ").length;
    const orig = matches.find((m) => m.start >= before + markerWords - 1 && m.start <= before + markerWords + 2);
    if (orig) {
      variantOf = orig.name;
      tokens = [...tokens.slice(0, before), ...tokens.slice(orig.end)];
      matches = findExercises(tokens, catalog);
    } else if (/variante/.test(marker[0]) && context) {
      variantOf = context;
    }
  }

  // Pedir alternativas: "variantes de banca", "maquina ocupada", "otra opcion para remo"
  if (!hasNumbers && /\b(variantes?|alternativas?|sustitut\w*|reemplaz\w*|otra opcion|otras opciones|otro ejercicio|ocupad[oa]|no hay|cambiar)\b/.test(text) && !variantOf) {
    return { intent: "variants", exercise: matches[0]?.name ?? context };
  }

  const doneWords = /\b(listo|lista|hecho|hecha|completad[oa]|complete|termine|terminado|terminada|acabe|done|finished)\b/;
  if (!hasNumbers && doneWords.test(text)) {
    if (matches.length) return { intent: "done", exercise: matches[0].name };
    // "listo" a secas con un ejercicio en curso → ese ejercicio; "terminé" a secas → la rutina
    if (context && /^(ya )?(listo|lista|hecho|hecha|done)\b/.test(text)) return { intent: "done", exercise: context };
    if (/\b(rutina|entreno|entrenamiento|dia|sesion|todo|workout)\b/.test(text) || /^(ya )?(termine|acabe|listo|done|finished)\b/.test(text)) return { intent: "finish" };
  }
  if (!hasNumbers && /\b(record|pr|maximo|mejor|progreso|ultima vez|ultimo|cuanto|best)\b/.test(text)) {
    return { intent: "query", exercise: matches[0]?.name ?? null };
  }
  if (!hasNumbers && matches.length) return { intent: "start", exercise: byEquipment(matches[0].name, tokens, catalog) };

  const dayOffset = dayOffsetOf(text);
  const entries: ParsedEntry[] = [];
  const incomplete: ParsedEntry[] = [];
  let unknownName: string | null = null;

  type Seg = { name: string; text: string; context?: boolean; base?: string };
  const segments: Seg[] = [];
  if (matches.length) {
    const isNum = (t: string) => /\d/.test(t);
    // "4x8 72kg sentadilla y 3x10 60kg banca": los números van delante de cada ejercicio
    const numbersFirst = tokens.slice(0, matches[0].start).some(isNum) && !tokens.slice(matches[matches.length - 1].end).some(isNum);
    matches.forEach((m, i) => {
      const own = tokens.slice(m.end, matches[i + 1]?.start ?? tokens.length);
      const before = tokens.slice(matches[i - 1]?.end ?? 0, m.start);
      const nums = numbersFirst ? before : i === 0 ? [...before.filter(isNum), ...own] : own;
      // Material mencionado junto al ejercicio (hasta el siguiente "y")
      const cut = own.findIndex((t) => JOIN.has(t));
      const name = byEquipment(m.name, [...tokens.slice(m.start, m.end), ...(cut < 0 ? own : own.slice(0, cut))], catalog);
      // Mención sin números de un ejercicio que ya está en el mensaje: no es otro registro
      if (!nums.some(isNum) && matches.some((o, j) => j !== i && sameExercise(o.name, m.name))) return;
      segments.push({ name, base: name !== m.name ? m.name : undefined, text: nums.join(" ") });
    });
  } else if (hasNumbers) {
    const firstNum = tokens.findIndex((t) => /\d/.test(t));
    const words = tokens.slice(0, firstNum < 0 ? tokens.length : firstNum).filter((t) => /^[a-z]+$/.test(t) && !STOP.has(t));
    if (words.length) {
      // Ejercicio desconocido: las palabras antes del primer número
      unknownName = words.slice(-4).join(" ");
      unknownName = unknownName.charAt(0).toUpperCase() + unknownName.slice(1);
      const known = catalog.find((c) => sameExercise(c.name, unknownName!));
      if (known) unknownName = null;
      segments.push({ name: known?.name ?? unknownName!, text: tokens.slice(firstNum).join(" ") });
    } else if (context && !variantOf) {
      // Serie a serie del ejercicio en curso: "segunda serie 7"
      segments.push({ name: context, text: tokens.join(" "), context: true });
    }
  }

  for (const seg of segments) {
    const cat = catalog.find((c) => c.name === seg.name);
    const last = history
      .filter((h) => sameExercise(h.exercise, seg.name))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
    const groups = parseNumbers(seg.text, !!cat?.bodyweight || !!seg.context);
    if (!groups.length) {
      // Nombrado sin números (los números eran de otro ejercicio): se pregunta, no se inventa
      incomplete.push({ exercise: seg.name, weight: null, sets: null, reps: null, assumed: [] });
      continue;
    }

    for (const g of groups) {
      // Un número suelto: si es mucho menor que el peso habitual, son repeticiones ("banca 8" con 60 kg)
      if (g.bare && g.weight !== null && last && last.weight > 0 && g.weight <= 30 && g.weight < last.weight * 0.6) {
        g.reps = Math.round(g.raw ?? g.weight); g.sets = 1; g.weight = null;
      }
      // Serie a serie: cada número es una serie, no "N series como la última vez"
      if (g.reps !== null && g.sets === null && (seg.context || cat?.bodyweight)) g.sets = 1;
      const e: ParsedEntry = { exercise: seg.name, weight: g.weight, sets: g.sets, reps: g.reps, assumed: [] };
      if (variantOf && !sameExercise(seg.name, variantOf)) e.variantOf = variantOf;
      else if (seg.base && catalog.find((c) => c.name === seg.base)?.today) e.variantOf = seg.base;
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

  return { intent: "log", dayOffset, entries, incomplete, unknownName, variantOf };
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
  /** Día (YYYY-MM-DD) de la sesión que provocó el último cambio automático de peso, y el peso anterior */
  progressedOn?: string;
  prevWeight?: number | null;
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

export const todayKey = (d = new Date()) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD local

type LogLike = { exercise: string; weight: number; sets: number; reps: number; date: string | Date };
export type Session = { day: string; weightKg: number; reps: number[]; total: number };

/** Sesiones de un ejercicio (más reciente primero). Las series más ligeras (calentamiento) no cuentan. */
export function sessionsOf(exercise: string, logs: LogLike[]): Session[] {
  const byDay = new Map<string, LogLike[]>();
  for (const l of logs) {
    if (!sameExercise(l.exercise, exercise)) continue;
    const k = todayKey(new Date(l.date));
    byDay.set(k, [...(byDay.get(k) ?? []), l]);
  }
  return Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, ls]) => {
      const flat = [...ls].sort((a, b) => +new Date(a.date) - +new Date(b.date))
        .flatMap((l) => Array.from({ length: l.sets }, () => ({ w: l.weight, r: l.reps })));
      const top = Math.max(...flat.map((f) => f.w));
      const reps = flat.filter((f) => f.w >= top - 1).map((f) => f.r);
      return { day, weightKg: top, reps, total: reps.reduce((a, r) => a + r, 0) };
    });
}

const LOWER = new Set(["squat", "hinge", "legpress", "lunge"]);

/**
 * Incremento de carga según el ejercicio (pauta NSCA para nivel intermedio):
 * tren inferior compuesto +5 kg; tren superior, máquinas y aislamiento +2.5 kg;
 * mancuernas +2.5 kg por mano; material en libras +5 lb (+10 lb en máquinas de placas).
 */
export function loadStep(it: Pick<PlanItem, "unit" | "per">, pattern = ""): number {
  if (it.unit === "lb") return it.per === "total" ? (LOWER.has(pattern) ? 10 : 5) : 5;
  if (it.per === "lado") return LOWER.has(pattern) ? 5 : 2.5;
  if (it.per === "mano" || it.per === "pierna") return 2.5;
  return LOWER.has(pattern) ? 5 : 2.5;
}

type Bi = { es: string; en: string };
export type Verdict = {
  kind: "new" | "incomplete" | "up" | "reps" | "hold" | "deload";
  /** Peso objetivo para la próxima sesión (en la unidad del plan); null = peso corporal */
  next: number | null;
  /** Meta concreta de la próxima sesión */
  goal: Bi;
  why: Bi;
  tip?: Bi;
  session?: Session;
  prev?: Session;
  /** El cambio de peso de esta sesión ya está aplicado en el plan */
  applied?: boolean;
};

const fmtReps = (r: number[]) => r.join("-");
const unitW = (w: number | null, it: Pick<PlanItem, "unit">) => (w === null || w === 0 ? "" : ` @ ${formatKg(w)} ${it.unit}`);

/**
 * Entrenador: doble progresión con rango de repeticiones.
 *  - Todas las series en el tope del rango → sube la carga (loadStep) y vuelve al mínimo.
 *  - Dentro del rango → mismo peso, +1 rep por serie.
 *  - Alguna serie bajo el mínimo → mismo peso; dos sesiones seguidas así → descarga −10 %.
 *  - 3 sesiones al mismo peso sin sumar repeticiones → descarga −10 % y reconstruir.
 *  - Peso corporal (máx): todas las series en 12+ (8+ con lastre) → +2.5 kg de lastre;
 *    si no, superar el total de repeticiones de la sesión anterior.
 */
export function coach(it: PlanItem, logs: LogLike[], pattern = ""): Verdict {
  const sessions = sessionsOf(it.exercise, logs);
  const s0 = sessions[0];
  const step = loadStep(it, pattern);
  const applied = !!s0 && it.progressedOn === s0.day;
  // Peso con el que se evalúa la sesión: si ya se aplicó un cambio por ella, el de antes del cambio
  const W = applied ? (it.prevWeight ?? null) : it.weight;
  const Wkg = W === null ? 0 : it.unit === "lb" ? roundTo(W * LB, 0.5) : W;

  if (!s0) {
    return {
      kind: "new", next: it.weight,
      goal: it.reps === "max"
        ? { es: `${it.sets} series al máximo`, en: `${it.sets} sets to max` }
        : { es: `${it.sets}×${it.reps[0]}-${it.reps[1]}${unitW(it.weight, it)}`, en: `${it.sets}×${it.reps[0]}-${it.reps[1]}${unitW(it.weight, it)}` },
      why: { es: "Primera sesión: anota cada serie y la rutina se ajusta sola.", en: "First session: log every set and the plan adapts." },
    };
  }

  const prev = sessions[1];
  const done = s0.reps.length;
  const tip = done >= 3 && s0.reps[0] - s0.reps[done - 1] >= Math.max(3, Math.ceil(s0.reps[0] * 0.35))
    ? { es: "Mucha caída entre la 1.ª y la última serie: descansa 2-3 min completos.", en: "Big drop from first to last set: rest a full 2-3 min." }
    : undefined;

  if (done < it.sets && s0.day === todayKey()) {
    return {
      kind: "incomplete", next: it.weight, session: s0, prev, tip,
      goal: { es: `Faltan ${it.sets - done} serie(s)`, en: `${it.sets - done} set(s) to go` },
      why: { es: `Llevas ${done}/${it.sets}: ${fmtReps(s0.reps)}.`, en: `${done}/${it.sets} done: ${fmtReps(s0.reps)}.` },
    };
  }

  const reps = s0.reps.slice(0, it.sets);

  // ── Peso corporal / al máximo ──
  if (it.reps === "max") {
    const threshold = Wkg > 0 ? 8 : 12;
    if (reps.length >= it.sets && Math.min(...reps) >= threshold) {
      const next = (W ?? 0) + (it.unit === "lb" ? 5 : 2.5);
      return {
        kind: "up", next, session: s0, prev, applied, tip,
        goal: { es: `${it.sets} series al máximo con ${formatKg(next)} ${it.unit} de lastre`, en: `${it.sets} sets to max with ${formatKg(next)} ${it.unit} added` },
        why: { es: `Todas las series en ${threshold}+ (${fmtReps(reps)}): toca añadir lastre.`, en: `Every set at ${threshold}+ (${fmtReps(reps)}): add weight.` },
      };
    }
    const better = !!prev && s0.total > prev.total;
    const stalled = !!prev && !!sessions[2] && s0.total <= prev.total && s0.total <= sessions[2].total;
    return {
      kind: better ? "reps" : "hold", next: W, session: s0, prev,
      tip: stalled
        ? { es: "3 sesiones sin subir el total: añade una serie extra o haz negativas lentas (3-5 s).", en: "3 sessions without progress: add a set or do slow negatives (3-5 s)." }
        : tip,
      goal: { es: `Supera ${s0.total} repeticiones en total`, en: `Beat ${s0.total} total reps` },
      why: better
        ? { es: `Subiste de ${prev!.total} a ${s0.total} repeticiones (${fmtReps(reps)}). Mismo plan, a por más.`, en: `Up from ${prev!.total} to ${s0.total} reps (${fmtReps(reps)}). Same plan, go for more.` }
        : prev
          ? { es: `${s0.total} repeticiones (${fmtReps(reps)}), sin mejorar las ${prev.total} anteriores. Mantén.`, en: `${s0.total} reps (${fmtReps(reps)}), not above ${prev.total}. Hold.` }
          : { es: `${s0.total} repeticiones (${fmtReps(reps)}). Esa es la marca a superar.`, en: `${s0.total} reps (${fmtReps(reps)}). That's the mark to beat.` },
    };
  }

  // ── Con rango de repeticiones ──
  const [min, max] = it.reps;
  if (W === null) {
    return { kind: "hold", next: null, session: s0, prev, goal: { es: `${it.sets}×${min}-${max}`, en: `${it.sets}×${min}-${max}` }, why: { es: `${fmtReps(reps)}.`, en: `${fmtReps(reps)}.` } };
  }
  if (s0.weightKg < Wkg - Math.max(1, Wkg * 0.02)) {
    return {
      kind: "hold", next: W, session: s0, prev, tip,
      goal: { es: `${it.sets}×${min}-${max}${unitW(W, it)}`, en: `${it.sets}×${min}-${max}${unitW(W, it)}` },
      why: { es: `Trabajaste con ${formatKg(s0.weightKg)} kg, por debajo del objetivo: repite ${formatKg(W)} ${it.unit}.`, en: `You used ${formatKg(s0.weightKg)} kg, below target: repeat ${formatKg(W)} ${it.unit}.` },
    };
  }

  // −10 % redondeado al escalón de carga más cercano (siempre al menos un escalón por debajo)
  const deload = Math.max(step, Math.min(W - step, Math.round((W * 0.9) / step) * step));
  const sameWeight = (s?: Session) => !!s && Math.abs(s.weightKg - s0.weightKg) <= 1;

  if (reps.length >= it.sets && reps.every((r) => r >= max)) {
    const next = W + step;
    const big = next / W > 1.15;
    return {
      kind: "up", next, session: s0, prev, applied, tip,
      goal: { es: `${it.sets}×${min}${unitW(next, it)} (vuelve al mínimo del rango)`, en: `${it.sets}×${min}${unitW(next, it)} (back to the bottom of the range)` },
      why: {
        es: `Todas las series en el tope (${fmtReps(reps)}): sube ${formatKg(step)} ${it.unit}.${big ? ` Es un salto grande en %: si no llegas a ${min}, vuelve al peso anterior y suma reps.` : ""}`,
        en: `Every set at the top (${fmtReps(reps)}): add ${formatKg(step)} ${it.unit}.${big ? ` Big % jump: if you can't hit ${min}, go back and add reps.` : ""}`,
      },
    };
  }
  if (reps.some((r) => r < min)) {
    const twice = sameWeight(prev) && prev!.reps.slice(0, it.sets).some((r) => r < min);
    if (twice) {
      return {
        kind: "deload", next: deload, session: s0, prev, applied, tip,
        goal: { es: `${it.sets}×${max}${unitW(deload, it)} y reconstruye`, en: `${it.sets}×${max}${unitW(deload, it)} and rebuild` },
        why: { es: `Dos sesiones seguidas con series por debajo de ${min} (${fmtReps(reps)}): descarga −10 %.`, en: `Two sessions in a row with sets under ${min} (${fmtReps(reps)}): deload −10%.` },
      };
    }
    return {
      kind: "hold", next: W, session: s0, prev, tip,
      goal: { es: `${it.sets}×${min}+${unitW(W, it)}`, en: `${it.sets}×${min}+${unitW(W, it)}` },
      why: { es: `Alguna serie por debajo de ${min} (${fmtReps(reps)}): mismo peso, busca ${min}+ en todas.`, en: `A set under ${min} (${fmtReps(reps)}): same weight, aim for ${min}+ on all.` },
    };
  }
  // Dentro del rango
  if (sameWeight(prev) && sameWeight(sessions[2]) && s0.total <= sessions[2].total) {
    return {
      kind: "deload", next: deload, session: s0, prev, applied, tip,
      goal: { es: `${it.sets}×${max}${unitW(deload, it)} y reconstruye`, en: `${it.sets}×${max}${unitW(deload, it)} and rebuild` },
      why: { es: `3 sesiones con ${formatKg(W)} ${it.unit} sin sumar repeticiones: descarga −10 % y vuelve a subir.`, en: `3 sessions at ${formatKg(W)} ${it.unit} without adding reps: deload −10% and climb back.` },
    };
  }
  const target = reps.map((r) => Math.min(max, r + 1));
  const gained = sameWeight(prev) ? s0.total - prev!.total : 0;
  return {
    kind: "reps", next: W, session: s0, prev, tip,
    goal: { es: `${fmtReps(target)}${unitW(W, it)}`, en: `${fmtReps(target)}${unitW(W, it)}` },
    why: {
      es: `Dentro del rango (${fmtReps(reps)}${gained > 0 ? `, +${gained} reps vs la última` : ""}): mismo peso, +1 rep por serie hasta ${max} en todas.`,
      en: `In range (${fmtReps(reps)}${gained > 0 ? `, +${gained} reps vs last` : ""}): same weight, +1 rep per set until all hit ${max}.`,
    },
  };
}


// ───────────────────────── variantes ─────────────────────────

// Familia por patrón para ejercicios propios que no están en la biblioteca
const FAMILY_BY_PATTERN: Record<MovementPattern, Family> = {
  press: "hpush", incline: "incline", dip: "dip", pull: "vpull", row: "hpull", hinge: "hinge", squat: "squat",
  legpress: "squat", lunge: "lunge", overhead: "vpush", raise: "lateral", curl: "biceps", extension: "triceps",
  core: "core", legcurl: "legcurl", legext: "legext", calf: "calf",
};

export type VariantOption = {
  name: string;
  equipment?: Equipment;
  bodyweight: boolean;
  /** Peso de partida aproximado en kg (por mano si perHand); null si no se puede estimar */
  startKg: number | null;
  perHand: boolean;
  /** Ya está en el catálogo del usuario */
  mine: boolean;
};

/**
 * Alternativas para un ejercicio (misma familia de movimiento). `lastKg`: el peso con el que trabaja
 * en el original, para estimar el de partida en la variante (redondeado y algo conservador).
 */
export function variantsFor(
  exercise: string,
  own: { name: string; pattern: string }[] = [],
  lastKg: number | null = null,
): VariantOption[] {
  const base = findInLibrary(exercise);
  const ownEx = own.find((o) => normalize(o.name) === normalize(exercise));
  const family = base?.family ?? (ownEx ? FAMILY_BY_PATTERN[ownEx.pattern as MovementPattern] : undefined);
  if (!family) return [];
  const mine = new Set(own.map((o) => normalize(o.name)));
  const lib = EXERCISE_LIBRARY.filter((e) => e.family === family && normalize(e.name) !== normalize(exercise));
  // Ejercicios propios del mismo patrón que no son de la biblioteca
  const extra = own.filter((o) => !findInLibrary(o.name) && normalize(o.name) !== normalize(exercise) && FAMILY_BY_PATTERN[o.pattern as MovementPattern] === family);
  const opts: VariantOption[] = lib.map((e) => {
    let startKg: number | null = null;
    if (!e.bodyweight && e.load && base?.load && lastKg && lastKg > 0) {
      const raw = (lastKg / base.load) * e.load * 0.9; // 10 % por debajo: técnica nueva, mejor quedarse corto
      startKg = roundTo(raw, e.perHand || raw < 20 ? 1 : 2.5);
    }
    return { name: e.name, equipment: e.equipment, bodyweight: !!e.bodyweight, startKg, perHand: !!e.perHand, mine: mine.has(normalize(e.name)) };
  });
  for (const o of extra) opts.push({ name: o.name, bodyweight: false, startKg: null, perHand: false, mine: true });
  // Primero las que ya usa, luego por material distinto al original (más útil si la máquina está ocupada)
  return opts.sort((a, b) => +b.mine - +a.mine || +(a.equipment === base?.equipment) - +(b.equipment === base?.equipment));
}
