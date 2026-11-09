import { useTranslation } from "react-i18next";
import GymTracker from "@/components/GymTracker";
import MissionHero from "@/components/mission/MissionHero";
import { SectionHead } from "@/components/mission/primitives";
import { PulseSignature } from "@/components/mission/signatures";
import { useLang } from "@/lib/lang";

// El tracker de gym vive en su propia página (antes compartía /deportes). Aquí crecerá con
// perfil, rutinas, nutrición y hábitos.
export default function Gym() {
  const { t } = useTranslation();
  const { L } = useLang();
  return (
    <>
      <MissionHero
        index="08"
        label={t("nav.gym")}
        title="Gym"
        description={L("Tu bitácora de entrenamiento: pesos, series y progreso.", "Your training log: weights, sets and progress.")}
        signature={<PulseSignature />}
        ghost="Training"
      />
      <section className="page-container py-20 sm:py-28">
        <SectionHead index="01" title="GymTracker" className="mb-10" />
        <GymTracker />
      </section>
    </>
  );
}
