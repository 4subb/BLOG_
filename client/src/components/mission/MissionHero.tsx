import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";
import { GhostWord, LiveClock, SpecSheet, SplitReveal, type Spec } from "./primitives";
import NowPlaying from "./NowPlaying";

interface MissionHeroProps {
  index: string;          // "02"
  label: string;          // "Ingeniería"
  title: string;          // titular gigante
  description?: ReactNode;
  specs?: Spec[];
  ghost?: string;         // palabra gigante de fondo
  signature?: ReactNode;  // animación propia de cada página (capa de fondo)
  actions?: ReactNode;
  aside?: ReactNode;      // visual opcional junto al titular (p. ej. retrato en Inicio)
  loading?: boolean;      // mientras carga se muestran todas las specs (evita saltos de layout)
}

/**
 * Cabecera única para todas las páginas: misma estructura (telemetría, titular, descripción, ficha
 * técnica), con una capa `signature` que da a cada sección su animación característica.
 */
export default function MissionHero({ index, label, title, description, specs: allSpecs, ghost, signature, actions, aside, loading }: MissionHeroProps) {
  // Un "000" o "—" en la ficha parece una sección rota: ya cargado, se ocultan las specs vacías
  const specs = loading ? allSpecs : allSpecs?.filter((s) => s.value !== 0 && s.value !== "—");
  return (
    <section className="relative isolate overflow-hidden border-b border-rock/40">
      {signature && <div className="absolute inset-0 -z-10">{signature}</div>}

      <div className="page-container relative pb-14 pt-8 sm:pb-20 sm:pt-10">
        {/* Telemetría */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="label-mono flex items-center justify-between gap-4 text-muted-foreground"
        >
          <span>
            <span className="text-foreground">[{index}]</span>
            <span className="mx-2">/</span>
            {label}
          </span>
          <span className="hidden min-w-0 items-center gap-6 sm:flex">
            <NowPlaying className="max-w-[34ch]" />
            <LiveClock className="shrink-0" />
          </span>
        </motion.div>

        <div className="mt-14 grid items-end gap-10 sm:mt-24 lg:grid-cols-12">
          <h1 className={`font-display text-[clamp(3.4rem,10.5vw,10.5rem)] ${aside ? "lg:col-span-8" : "max-w-[14ch] lg:col-span-12"}`}>
            <SplitReveal text={title} delay={0.1} />
          </h1>
          {aside && <div className="lg:col-span-4 lg:justify-self-end">{aside}</div>}
        </div>

        {(description || specs || actions) && (
          <div className="mt-12 grid gap-12 sm:mt-20 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.45 }}
              className="lg:col-span-5"
            >
              {description && <div className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</div>}
              {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
            </motion.div>
            {specs && specs.length > 0 && <SpecSheet specs={specs} className="lg:col-span-6 lg:col-start-7" />}
          </div>
        )}
      </div>

      {ghost && <GhostWord text={ghost} className="-mt-6 sm:-mt-16" />}
    </section>
  );
}
