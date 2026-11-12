// Carga MI rutina semanal y MI catálogo de ejercicios en la cuenta indicada (la del autor).
// Los demás usuarios arman los suyos desde la web. No toca los registros (gym_logs);
// el catálogo de esa cuenta se reemplaza por estos ejercicios.
//
//   npx tsx --env-file .env scripts/seed-gym.ts correo@ejemplo.com
//   (para producción: --env-file .env.production)
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users, gymExercises, gymPlans, gymPlanSchema } from "../shared/schema";
import { EXERCISE_LIBRARY, type GymPlan } from "../shared/gym";

const PLAN: GymPlan = {
  days: [
    {
      dow: 1, title: "Upper A · empuje", kind: "gym",
      note: "En la mañana: medición oficial (peso, cintura y composición corporal).",
      items: [
        { exercise: "Press banca", sets: 4, reps: [6, 8], weight: 60, unit: "kg", per: "total", note: "20 kg por lado + barra olímpica" },
        { exercise: "Press militar", sets: 3, reps: [8, 10], weight: 30, unit: "kg", per: "total", note: "Con barra · 10 kg por lado en barra corta" },
        { exercise: "Fondos", sets: 3, reps: "max", weight: null, unit: "kg", per: "total", note: "Última marca registrada: 10-10-6" },
        { exercise: "Elevación lateral", sets: 3, reps: [12, 15], weight: 7.5, unit: "kg", per: "mano" },
        { exercise: "Fly con mancuerna", sets: 3, reps: [12, 12], weight: 12.5, unit: "kg", per: "mano" },
        { exercise: "Extensión de tríceps en polea", sets: 3, reps: [10, 12], weight: 42.5, unit: "kg", per: "total", note: "Agarre V" },
      ],
    },
    {
      dow: 2, title: "Lower A · fuerza", kind: "gym",
      items: [
        { exercise: "Sentadilla", sets: 4, reps: [6, 8], weight: 72.5, unit: "kg", per: "total", note: "Barra libre · va primero" },
        { exercise: "Peso muerto rumano", sets: 3, reps: [8, 10], weight: 67.5, unit: "kg", per: "total" },
        { exercise: "Prensa 90°", sets: 3, reps: [10, 12], weight: 70, unit: "kg", per: "lado" },
        { exercise: "Curl femoral unilateral", sets: 3, reps: [10, 12], weight: 22.5, unit: "kg", per: "pierna" },
        { exercise: "Pantorrilla sentado", sets: 3, reps: [15, 20], weight: 85, unit: "kg", per: "total" },
      ],
    },
    {
      dow: 3, title: "Carrera, movilidad y core", kind: "cardio", items: [],
      blocks: [
        { title: "Carrera", lines: ["25-30 min a 8.5 km/h, inclinación 0-1 %", "5 min de caminata antes y después"] },
        { title: "Movilidad · 15 min", lines: [
          "90/90 de cadera · 8 por lado", "Flexor en zancada · 60 s por lado", "Rodilla a pared · 10 por lado",
          "Rotación torácica · 8 por lado", "Dislocaciones con banda · 10", "Bisagra contra la pared · 10",
        ] },
        { title: "Core · 10 min, sin peso", lines: [
          "Vacío abdominal · 4×20 s", "Plancha frontal · 3×45 s", "Dead bug · 3×10 por lado",
          "Hollow hold · 3×20 s", "Plancha lateral · 3×30 s por lado",
        ] },
      ],
    },
    {
      dow: 4, title: "Upper B · jalón", kind: "gym",
      items: [
        { exercise: "Dominadas", sets: 4, reps: "max", weight: null, unit: "kg", per: "total", note: "Estrictas, agarre prono · llevas 4×6" },
        { exercise: "Remo con barra", sets: 4, reps: [8, 10], weight: 55, unit: "kg", per: "total", note: "17.5 kg por lado + barra olímpica" },
        { exercise: "Pulldown", sets: 3, reps: [10, 12], weight: 47.5, unit: "kg", per: "total" },
        { exercise: "Remo en banca al ombligo", sets: 3, reps: [10, 12], weight: 50, unit: "kg", per: "total" },
        { exercise: "Apertura invertida", sets: 3, reps: [12, 15], weight: 35, unit: "kg", per: "total" },
        { exercise: "Curl de bíceps", sets: 3, reps: [10, 12], weight: 10, unit: "kg", per: "mano" },
      ],
    },
    {
      dow: 5, title: "Lower B · unilateral", kind: "gym",
      items: [
        { exercise: "Peso muerto rumano", sets: 3, reps: [8, 10], weight: 67.5, unit: "kg", per: "total" },
        { exercise: "Sentadilla búlgara", sets: 3, reps: [10, 12], weight: 40, unit: "lb", per: "mano", note: "Reps por pierna" },
        { exercise: "Hip thrust", sets: 3, reps: [10, 12], weight: 45, unit: "lb", per: "lado", note: "Con barra · o 35 kg en máquina" },
        { exercise: "Zancadas caminando", sets: 3, reps: [10, 12], weight: 40, unit: "lb", per: "mano", note: "Reps por pierna" },
        { exercise: "Extensión de cuádriceps", sets: 3, reps: [12, 15], weight: 180, unit: "lb", per: "total" },
      ],
    },
    { dow: 6, title: "Opcional", kind: "rest", items: [], blocks: [{ title: "Libre", lines: ["Senderismo, caminata o descanso"] }] },
    { dow: 7, title: "Opcional", kind: "rest", items: [], blocks: [{ title: "Libre", lines: ["Senderismo, caminata o descanso"] }] },
  ],
  rules: [
    "Deja 1-2 repeticiones en reserva y usa rango completo.",
    "Descansa 2-3 min en los compuestos y 60-90 s en el resto.",
    "Cuando completes el tope del rango en todas las series, sube 2.5 kg la siguiente semana.",
    "Antes de pierna: 10 de rodilla a pared por lado y 10 bisagras contra la pared.",
  ],
};

const MY_EXERCISES = [
  "Press banca", "Fly con mancuerna", "Fondos", "Press militar", "Elevación lateral", "Apertura invertida",
  "Dominadas", "Remo con barra", "Pulldown", "Remo en banca al ombligo", "Curl de bíceps",
  "Extensión de tríceps en polea", "Sentadilla", "Peso muerto rumano", "Prensa 90°", "Curl femoral unilateral",
  "Pantorrilla sentado", "Sentadilla búlgara", "Hip thrust", "Zancadas caminando", "Extensión de cuádriceps",
].map((name) => {
  const def = EXERCISE_LIBRARY.find((e) => e.name === name);
  if (!def) throw new Error(`"${name}" no está en EXERCISE_LIBRARY`);
  return def;
});

const email = process.argv[2]?.trim().toLowerCase();
if (!email) { console.error("Uso: tsx --env-file .env scripts/seed-gym.ts <email>"); process.exit(1); }

const plan = gymPlanSchema.parse(PLAN);
const names = new Set(MY_EXERCISES.map((e) => e.name));
const missing = plan.days.flatMap((d) => d.items.map((i) => i.exercise)).filter((n) => !names.has(n));
if (missing.length) { console.error("Ejercicios del plan que no están en el catálogo:", missing); process.exit(1); }

const [user] = await db.select().from(users).where(eq(users.email, email));
if (!user) { console.error(`No existe ningún usuario con el correo ${email}`); process.exit(1); }

await db.transaction(async (tx) => {
  await tx.delete(gymExercises).where(eq(gymExercises.userId, user.id));
  await tx.insert(gymExercises).values(MY_EXERCISES.map((e) => ({ ...e, bodyweight: !!e.bodyweight, userId: user.id })));
  await tx.insert(gymPlans).values({ userId: user.id, plan })
    .onConflictDoUpdate({ target: gymPlans.userId, set: { plan, updatedAt: new Date() } });
});
console.log(`✓ ${email}: ${MY_EXERCISES.length} ejercicios y rutina de ${plan.days.length} días cargados.`);
process.exit(0);
