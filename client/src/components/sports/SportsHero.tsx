import { AnimatePresence, motion } from "framer-motion";
import { LiveClock } from "@/components/mission/primitives";
import NowPlaying from "@/components/mission/NowPlaying";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SportKey } from "./media";
import { useLang, type Bi } from "@/lib/lang";

export const SPORTS: { key: SportKey; label: Bi; tagline: Bi }[] = [
  { key: "f1", label: { es: "Fórmula 1", en: "Formula 1" }, tagline: { es: "Campeonato del mundo en vivo: clasificación, carreras y la historia de la categoría reina.", en: "The world championship live: standings, races and the history of the pinnacle of motorsport." } },
  { key: "ciclismo", label: { es: "Ciclismo", en: "Cycling" }, tagline: { es: "Ciclismo de ruta masculino: grandes vueltas, monumentos y sus leyendas.", en: "Men's road cycling: Grand Tours, Monuments and their legends." } },
  { key: "tenis", label: { es: "Tenis", en: "Tennis" }, tagline: { es: "Circuito ATP y WTA: rankings, torneos y los partidos que hicieron historia.", en: "ATP and WTA tours: rankings, tournaments and the matches that made history." } },
];

interface Props {
  sport: SportKey;
  onSport: (s: SportKey) => void;
  accent?: string;
}

/**
 * Hero de Deportes: selector de disciplina + nombre del deporte en grande, sobrio y sin imágenes.
 * (Las escenas animadas y el titular con foto están guardados en ./scenes para retomarlos.)
 */
export default function SportsHero({ sport, onSport }: Props) {
  const meta = SPORTS.find((s) => s.key === sport)!;
  const index = SPORTS.findIndex((s) => s.key === sport);
  const { L, pick, lang } = useLang();
  const title = pick(meta.label).toLocaleUpperCase(lang);
  // Mismo titular que el resto de páginas (font-display, tope 10.5rem), pero siempre en un renglón:
  // en palabras largas el tamaño baja lo justo para caber en el ancho.
  const fontSize = `clamp(2.4rem, ${Math.min(10.5, 86 / (title.length * 0.74)).toFixed(2)}vw, 10.5rem)`;

  return (
    <section className="relative isolate overflow-hidden border-b border-rock/40">
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b opacity-40" />

      <div className="page-container relative pb-6 pt-8 sm:pt-10">
        {/* Telemetría */}
        <div className="label-mono flex items-center justify-between gap-4 text-muted-foreground">
          <span>
            <span className="text-foreground">[04]</span>
            <span className="mx-2">/</span>
            {L("Deportes", "Sports")}
            <span className="mx-2">/</span>
            <span className="text-foreground">{pick(meta.label)}</span>
          </span>
          <span className="hidden min-w-0 items-center gap-6 sm:flex">
            <NowPlaying className="max-w-[34ch]" />
            <LiveClock className="shrink-0" />
          </span>
        </div>

        {/* Selector de disciplina */}
        <div role="tablist" aria-label={L("Disciplina", "Discipline")} className="mt-10 flex flex-wrap gap-2 sm:mt-14">
          {SPORTS.map((s, i) => {
            const on = s.key === sport;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={on}
                onClick={() => onSport(s.key)}
                className={cn(
                  "label-mono relative rounded-full border px-4 py-2 transition-colors",
                  on ? "border-foreground text-background" : "border-rock/60 text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {on && <motion.span layoutId="sport-pill" className="absolute inset-0 -z-10 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className={on ? "text-signal" : "text-foreground/60"}>({String(i + 1).padStart(2, "0")})</span> {pick(s.label)}
              </button>
            );
          })}
        </div>

        {/* Nombre */}
        <h1 className="font-display mt-12 whitespace-nowrap sm:mt-16" style={{ fontSize }}>
          {title}
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 lg:grid-cols-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={sport}
              className="max-w-[52ch] text-lg text-muted-foreground lg:col-span-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <span className="label-mono mr-3 text-foreground">({String(index + 1).padStart(2, "0")})</span>
              {pick(meta.tagline)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
