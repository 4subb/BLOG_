import { useTranslation } from "react-i18next";

/** Estado vacío: mismo lenguaje que las secciones (regla + display tenue + nota mono). */
export default function EmptyMission() {
  const { t } = useTranslation();
  return (
    <div className="border-t border-rock/50 py-20 sm:py-28">
      <p className="font-display text-[clamp(2rem,5vw,4rem)] text-muted-foreground/40">{t("ui.empty")}</p>
      <p className="label-mono mt-6 flex items-center gap-2 text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-signal" /> Standby
      </p>
    </div>
  );
}
