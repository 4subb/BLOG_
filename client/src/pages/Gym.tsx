import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MissionHero from "@/components/mission/MissionHero";
import { Counter, SectionHead } from "@/components/mission/primitives";
import { PulseSignature } from "@/components/mission/signatures";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/lib/lang";
import GymChat from "@/components/gym/GymChat";
import ExerciseGrid from "@/components/gym/ExerciseGrid";
import GymHistory from "@/components/gym/GymHistory";
import PlanToday from "@/components/gym/PlanToday";
import WeekPlan from "@/components/gym/WeekPlan";
import PlanEditor from "@/components/gym/PlanEditor";
import { useGym } from "@/components/gym/useGym";

// Gym: chat de registro en lenguaje natural + catálogo animado + historial.
export default function Gym() {
  const { t } = useTranslation();
  const { L } = useLang();
  const { user, isLoading } = useAuth();
  const gym = useGym(!!user);
  const [prefill, setPrefill] = useState<{ text: string; n: number }>();
  const chatRef = useRef<HTMLDivElement>(null);
  const weekRef = useRef<HTMLElement>(null);
  const [editingPlan, setEditingPlan] = useState(false);
  const openEditor = () => { setEditingPlan(true); setTimeout(() => weekRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  const kpis = useMemo(() => {
    const today = new Date().toLocaleDateString("sv-SE");
    const weekAgo = Date.now() - 7 * 864e5;
    const week = gym.logs.filter((l) => +new Date(l.date) >= weekAgo);
    return {
      today: gym.logs.filter((l) => new Date(l.date).toLocaleDateString("sv-SE") === today).reduce((a, l) => a + l.sets, 0),
      weekVolume: Math.round(week.reduce((a, l) => a + l.weight * l.sets * l.reps, 0)),
      weekDays: new Set(week.map((l) => new Date(l.date).toLocaleDateString("sv-SE"))).size,
      total: Math.round(gym.logs.reduce((a, l) => a + l.weight * l.sets * l.reps, 0)),
    };
  }, [gym.logs]);

  const pick = (text: string) => {
    setPrefill({ text, n: Date.now() });
    chatRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <MissionHero
        index="08"
        label={t("nav.gym")}
        title="Gym"
        description={L("Tu bitácora de entrenamiento: escribe lo que hiciste y se registra solo.", "Your training log: write what you did and it logs itself.")}
        signature={<PulseSignature />}
        ghost="Training"
      />

      {isLoading ? (
        <section className="page-container py-20 sm:py-28" aria-busy />
      ) : !user ? (
        <section className="page-container py-20 sm:py-28">
          <div className="flex flex-col items-start justify-between gap-6 border border-dashed border-rock/70 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="label-mono flex items-center gap-2 text-signal"><span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" /> {L("Acceso restringido", "Restricted access")}</p>
              <p className="mt-3 max-w-md text-muted-foreground">{L("Inicia sesión para registrar tus entrenamientos y ver tu progreso.", "Sign in to log your workouts and track your progress.")}</p>
            </div>
            <a href="/login" className="label-mono inline-flex h-10 items-center rounded-full border border-foreground px-5 transition-colors hover:bg-foreground hover:text-background">{L("Acceso →", "Sign in →")}</a>
          </div>
        </section>
      ) : (
        <>
          <section className="page-container py-20 sm:py-28">
            <SectionHead index="01" title={L("Registro", "Log")} aside={L("Escribe como hablas", "Write like you talk")} className="mb-10" />
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div ref={chatRef}>
                <GymChat gym={gym} userId={user.id} prefill={prefill} />
              </div>
              <PlanToday gym={gym} onPick={pick} onCreate={openEditor} />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-px border border-rock/70 bg-rock/70 lg:grid-cols-4">
              {[
                { k: L("Series hoy", "Sets today"), v: kpis.today, u: "" },
                { k: L("Días esta semana", "Days this week"), v: kpis.weekDays, u: "/7" },
                { k: L("Volumen 7 días", "7-day volume"), v: kpis.weekVolume, u: "kg" },
                { k: L("Tonelaje total", "Total tonnage"), v: kpis.total, u: "kg" },
              ].map((s) => (
                <div key={s.k} className="bg-background p-5">
                  <dt className="label-mono text-muted-foreground">{s.k}</dt>
                  <dd className="mt-2 font-display text-3xl font-semibold tabular-nums">
                    <Counter key={s.v} value={s.v} duration={1} />
                    {s.u && <span className="ml-1 text-base text-muted-foreground">{s.u}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section ref={weekRef} className="page-container scroll-mt-24 pb-20 sm:pb-28">
            <SectionHead
              index="02"
              title={editingPlan ? L("Editar rutina", "Edit routine") : L("Semana", "Week")}
              aside={!editingPlan && (
                <button onClick={openEditor} className="hover:text-foreground">
                  {gym.plan ? L("Editar rutina →", "Edit routine →") : L("Crear mi rutina →", "Create my routine →")}
                </button>
              )}
              className="mb-10"
            />
            {editingPlan ? (
              <PlanEditor gym={gym} onClose={() => setEditingPlan(false)} />
            ) : gym.plan ? (
              <WeekPlan gym={gym} onPick={pick} />
            ) : (
              <div className="flex flex-col items-start gap-4 border border-dashed border-rock/70 p-8">
                <p className="font-display text-lg font-semibold">{L("Aún no tienes rutina", "No routine yet")}</p>
                <p className="max-w-lg text-sm text-muted-foreground">
                  {L("Arma tu semana: qué ejercicios tocan cada día, series, rango de repeticiones y el peso objetivo. La web te avisará cuándo subir de peso.",
                     "Plan your week: exercises per day, sets, rep range and target weight. The site will tell you when to go up in weight.")}
                </p>
                <button onClick={openEditor} className="label-mono h-10 rounded-full bg-foreground px-5 text-background">{L("Crear mi rutina", "Create my routine")}</button>
              </div>
            )}
          </section>

          <section className="page-container pb-20 sm:pb-28">
            <SectionHead index="03" title={L("Mis ejercicios", "My exercises")} aside={L("Toca uno para registrarlo", "Tap one to log it")} className="mb-10" />
            <ExerciseGrid gym={gym} onPick={(name) => pick(`${name.toLowerCase()} `)} />
          </section>

          <section className="page-container pb-20 sm:pb-28">
            <SectionHead index="04" title={L("Historial", "History")} className="mb-6" />
            <GymHistory gym={gym} />
          </section>
        </>
      )}
    </>
  );
}
