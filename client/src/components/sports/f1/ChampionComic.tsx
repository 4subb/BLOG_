import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { flagColors } from "@/components/sports/Flag";
import PhotoCredit from "@/components/sports/PhotoCredit";
import { sized, type Photo } from "@/components/sports/media";
import { easeOutExpo } from "@/lib/motion";
import type { F1Driver } from "@/lib/f1";
import { Trophy } from "./ChampionScene";
import { useLang, type Bi } from "@/lib/lang";

/*
 * Escena del campeón como página de cómic pop-art: fotos reales (Wikimedia Commons) con un
 * filtro de ilustración (tinta en los bordes + color posterizado + semitono) y tres viñetas
 * que se revelan en secuencia:
 *   1. el monoplaza entra a toda velocidad y frena con humo   2. el piloto celebra subido al coche
 *   3. la portada: año, nombre y trofeo con confeti de su bandera.
 */

interface Props {
  driver: F1Driver;
  season: string;
  lead: number;
  remaining: number;
  art: { car: Photo; celebrate: Photo; carFacing: "left" | "right"; shout: string; celebrateCaption: Bi };
}

const INK = "hsl(var(--foreground))";

export default function ChampionComic({ driver, season, lead, remaining, art }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [take, setTake] = useState(0);
  const { L, pick } = useLang();
  // Las animaciones internas (auto, humo, bocadillo…) arrancan al montar: se monta al entrar en pantalla
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useInView(gridRef, { once: true, amount: 0.15 });
  const colors = flagColors(driver.nationality) ?? ["hsl(var(--signal))", "hsl(var(--background))", INK];
  const dir = art.carFacing === "left" ? 1 : -1; // el coche entra desde el lado contrario al que mira

  return (
    <div className="relative">
      <ComicFilters />

      {/* La cuadrícula dispara el revelado (una viñeta recortada al 100% no cuenta como visible) */}
      <motion.div ref={gridRef} key={take} className="grid gap-3 md:grid-cols-5" initial={reduce ? "show" : "hidden"} animate={seen || reduce ? "show" : "hidden"}>
        {/* ── Viñeta 1: llegada ── */}
        <Panel className="aspect-[16/9] md:col-span-3" delay={0} reduce={reduce} seen={seen || reduce}>
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { x: `${dir * 38}%`, scale: 1.12 }}
            animate={{ x: "0%", scale: 1.04 }}
            transition={{ duration: 1.3, ease: [0.12, 0.9, 0.25, 1], delay: 0.25 }}
          >
            <ComicImage photo={art.car} />
          </motion.div>
          <Halftone />

          {!reduce && (
            <>
              {/* líneas de velocidad que se apagan al frenar */}
              <motion.svg
                className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 160 90" preserveAspectRatio="none"
                initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.5 }}
              >
                {[18, 30, 44, 58, 70].map((y, i) => (
                  <line key={y} x1={dir > 0 ? 100 + i * 6 : 0} x2={dir > 0 ? 160 : 60 - i * 6} y1={y} y2={y} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
                ))}
              </motion.svg>
              {/* humo de frenada en la rueda trasera */}
              <div className={`pointer-events-none absolute bottom-[14%] ${dir > 0 ? "right-[10%]" : "left-[10%]"}`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute block rounded-full border-2 border-foreground bg-background"
                    style={{ width: 34 + i * 10, height: 34 + i * 10, left: -(17 + i * 5), top: -(17 + i * 5) }}
                    initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                    animate={{ opacity: [0, 0.95, 0], scale: [0.2, 1, 1.4], x: dir * (30 + i * 22), y: -(10 + i * 8) }}
                    transition={{ delay: 1.05 + i * 0.09, duration: 1.4, ease: "easeOut" }}
                  />
                ))}
              </div>
            </>
          )}

          {/* onomatopeya */}
          <motion.span
            className={`absolute top-[10%] ${dir > 0 ? "right-[6%]" : "left-[6%]"} font-display text-[clamp(1.8rem,5vw,3.6rem)] text-signal [-webkit-text-stroke:2px_hsl(var(--foreground))] [paint-order:stroke_fill]`}
            initial={reduce ? false : { scale: 0, rotate: -18, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            transition={{ default: { delay: 1.1, type: "spring", stiffness: 380, damping: 14 }, opacity: { delay: 1.1, duration: 0.15 } }}
          >
            ¡SKRRRT!
          </motion.span>
          <Caption>#{driver.number} · {driver.team} · {season}</Caption>
        </Panel>

        {/* ── Viñeta 2: celebración ── */}
        <Panel className="aspect-[4/5] md:col-span-2 md:row-span-2 md:aspect-auto" delay={0.55} reduce={reduce} seen={seen || reduce}>
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.02 }}
            animate={reduce ? undefined : { scale: [1.02, 1.14] }}
            transition={{ duration: 9, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            style={{ originX: 0.45, originY: 0.25 }}
          >
            <ComicImage photo={art.celebrate} position="45% 30%" />
          </motion.div>
          <Halftone />
          {/* banda tricolor en la esquina */}
          <div className="pointer-events-none absolute -right-10 top-6 flex w-48 rotate-45 flex-col">
            {colors.slice(0, 3).map((c, i) => <span key={i} className="h-2.5 border-y border-foreground/40" style={{ background: c }} />)}
          </div>
          {/* bocadillo */}
          <motion.div
            className="absolute left-[6%] top-[7%] max-w-[78%]"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ scale: { delay: 1.6, type: "spring", stiffness: 300, damping: 16 }, opacity: { delay: 1.6, duration: 0.2 } }}
            style={{ originX: 0.2, originY: 1 }}
          >
            <div className="relative rounded-[1.4rem] border-[3px] border-foreground bg-background px-4 py-2.5">
              <p className="font-display text-[clamp(1.2rem,2.6vw,1.9rem)] leading-none">{art.shout}</p>
              <svg className="absolute -bottom-[18px] left-10 h-5 w-6" viewBox="0 0 24 20" aria-hidden>
                <path d="M2 0 L22 0 L6 18 Z" fill="hsl(var(--background))" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
                <rect x="0" y="-3" width="24" height="4" fill="hsl(var(--background))" />
              </svg>
            </div>
          </motion.div>
          <Caption bottom>{pick(art.celebrateCaption)}</Caption>
        </Panel>

        {/* ── Viñeta 3: portada ── */}
        <Panel className="min-h-[15rem] md:col-span-3" delay={1.1} reduce={reduce} seen={seen || reduce} dark>
          <div className="relative grid min-h-[15rem] grid-cols-[1fr_auto] items-end gap-4 p-5 sm:p-7">
            <div className="relative z-10">
              <p className="label-mono flex items-center gap-2 text-background/70">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> {L("Campeón del mundo", "World Champion")}
              </p>
              <p
                className="mt-2 inline-block bg-clip-text font-display text-[clamp(4.5rem,11vw,8.5rem)] text-transparent [-webkit-background-clip:text]"
                style={{ backgroundImage: `linear-gradient(90deg, ${colors[0]} 0 33.4%, ${colors[1] ?? colors[0]} 33.4% 66.7%, ${colors[2] ?? colors[0]} 66.7%)` }}
              >
                {season}
              </p>
              <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] text-background">{driver.firstName} {driver.lastName}</p>
              <p className="label-mono mt-3 text-background/60">
                {driver.wins} {L("victorias", "wins")} · {driver.points} pts · +{lead} {L("a falta de", "with")} {remaining} {remaining === 1 ? L("carrera", "race") : L("carreras", "races")}{L("", " to go")}
              </p>
            </div>
            <motion.svg
              viewBox="-40 -100 80 110" className="h-36 w-28 sm:h-44 sm:w-32"
              initial={reduce ? false : { y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ y: { delay: 1.6, type: "spring", stiffness: 200, damping: 12 }, opacity: { delay: 1.6, duration: 0.3 } }}
              aria-hidden
            >
              <motion.g animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -3, 3, 0] }} transition={{ delay: 2.3, duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                <g transform="scale(1.6)" style={{ filter: "drop-shadow(0 0 0 hsl(var(--background)))" }}><Trophy /></g>
              </motion.g>
              {!reduce && [[-30, -80], [28, -70], [-20, -30], [30, -24]].map(([x, y], i) => (
                <motion.path
                  key={i}
                  d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
                  fill="#f4c430"
                  transform={`translate(${x} ${y})`}
                  animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                  transition={{ delay: 2 + i * 0.35, duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
                />
              ))}
            </motion.svg>
            {!reduce && <Confetti colors={colors} />}
          </div>
        </Panel>
      </motion.div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <div className="flex min-w-0 flex-wrap gap-x-5">
          <PhotoCredit photo={art.car} />
          <PhotoCredit photo={art.celebrate} />
        </div>
        {!reduce && (
          <button
            type="button"
            onClick={() => setTake((t) => t + 1)}
            className="label-mono inline-flex items-center gap-1.5 rounded-full border border-rock/50 px-3 py-1.5 text-muted-foreground transition-colors hover:border-signal hover:text-signal"
          >
            <RotateCcw className="h-3 w-3" /> {L("Repetir", "Replay")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Piezas ───────────────────────── */

function Panel({ children, className, delay, reduce, seen, dark = false }: { children: React.ReactNode; className?: string; delay: number; reduce: boolean; seen: boolean; dark?: boolean }) {
  return (
    <motion.div
      className={`relative overflow-hidden border-[3px] border-foreground ${dark ? "bg-foreground" : "bg-muted"} ${className ?? ""}`}
      variants={{
        hidden: { clipPath: "inset(0 100% 0 0)" },
        show: { clipPath: "inset(0 0% 0 0)", transition: { duration: reduce ? 0 : 0.75, ease: easeOutExpo, delay: reduce ? 0 : delay } },
      }}
    >
      {seen && children}
    </motion.div>
  );
}

/** Foto con el filtro de ilustración, a sangre dentro de la viñeta. */
function ComicImage({ photo, position = "50% 50%" }: { photo: Photo; position?: string }) {
  const [x, y] = position.split(" ").map((v) => (parseFloat(v) <= 33 ? "Min" : parseFloat(v) >= 67 ? "Max" : "Mid"));
  return (
    <svg className="absolute inset-0 h-full w-full" aria-label={photo.title} role="img">
      <image
        href={sized(photo, 1280)}
        width="100%"
        height="100%"
        preserveAspectRatio={`x${x}Y${y} slice`}
        filter="url(#comic-ink)"
      />
    </svg>
  );
}

/** Trama de puntos tipo imprenta, multiplicada sobre la foto. */
function Halftone() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
      style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 22%, transparent 24%)", backgroundSize: "6px 6px" }}
    />
  );
}

function Caption({ children, bottom = false }: { children: React.ReactNode; bottom?: boolean }) {
  return (
    <p className={`label-mono absolute ${bottom ? "bottom-3" : "top-3"} left-3 max-w-[85%] border-2 border-foreground bg-[#f7e9a8] px-2.5 py-1 text-foreground`}>
      {children}
    </p>
  );
}

/**
 * Filtro "tinta + póster": satura y posteriza el color (5 niveles por canal) y multiplica encima
 * los bordes detectados con un laplaciano sobre la luminancia, como un entintado de cómic.
 */
function ComicFilters() {
  const levels = "0 0.16 0.33 0.5 0.66 0.83 1";
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <filter id="comic-ink" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="saturate" values="1.35" result="sat" />
          <feComponentTransfer in="sat" result="poster">
            <feFuncR type="discrete" tableValues={levels} />
            <feFuncG type="discrete" tableValues={levels} />
            <feFuncB type="discrete" tableValues={levels} />
          </feComponentTransfer>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="gray" />
          <feGaussianBlur in="gray" stdDeviation="1.3" result="soft" />
          <feConvolveMatrix in="soft" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="edges" />
          <feComponentTransfer in="edges" result="ink">
            <feFuncR type="linear" slope="-9" intercept="1.12" />
            <feFuncG type="linear" slope="-9" intercept="1.12" />
            <feFuncB type="linear" slope="-9" intercept="1.12" />
          </feComponentTransfer>
          <feBlend in="poster" in2="ink" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: 1.7 + ((i * 13) % 20) / 10,
    rot: ((i * 71) % 360) - 180,
    drift: ((i * 29) % 60) - 30,
    color: colors[i % colors.length],
    w: 6 + (i % 3) * 3,
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-4 block border border-foreground/50"
          style={{ left: p.left, width: p.w, height: p.w * 0.5, background: p.color }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: [-20, 320], x: [0, p.drift], opacity: [0, 1, 1, 0], rotate: [0, p.rot * 3] }}
          transition={{ delay: p.delay, duration: 3.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
