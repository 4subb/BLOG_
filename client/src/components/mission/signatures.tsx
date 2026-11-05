import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";
import { Brackets } from "./primitives";
import { cn } from "@/lib/utils";

/* Capas de fondo que se montan en <MissionHero signature={...}>. Todas son pointer-events-none:
   escuchan el cursor en window para no bloquear los clics del contenido. */

const draw = (delay = 0, duration = 1.8) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { duration, ease: easeOutExpo, delay }, opacity: { duration: 0.2, delay } },
});

/** Posición del cursor relativa a un contenedor (null si está fuera). */
function useLocalPointer(ref: React.RefObject<HTMLElement>) {
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      setPos(inside ? { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height } : null);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [ref]);
  return pos;
}

/* ───────────── Ingeniería: plano técnico + mira con coordenadas ───────────── */
export function BlueprintSignature() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useLocalPointer(ref);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-80" />
      <svg className="absolute right-[-12%] top-[4%] h-[70%] w-auto text-rock/60 sm:right-[-4%]" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="0.75">
        <motion.circle cx="200" cy="200" r="170" {...draw(0.2, 2.2)} />
        <motion.circle cx="200" cy="200" r="110" strokeDasharray="3 5" {...draw(0.5, 2)} />
        <motion.circle cx="200" cy="200" r="46" {...draw(0.8)} />
        <motion.path d="M200 10 V390 M10 200 H390" {...draw(0.4, 2.4)} />
        <motion.path d="M80 80 L320 320 M320 80 L80 320" strokeOpacity="0.5" {...draw(0.9, 2)} />
        <motion.path d="M30 380 H370 M30 372 V388 M370 372 V388" {...draw(1.1)} />
        <motion.text x="200" y="372" textAnchor="middle" fill="currentColor" stroke="none" className="font-mono text-[9px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          Ø 340.00
        </motion.text>
      </svg>
      {/* Mira */}
      {pos && (
        <>
          <div className="absolute inset-y-0 w-px bg-signal/40" style={{ left: pos.x }} />
          <div className="absolute inset-x-0 h-px bg-signal/40" style={{ top: pos.y }} />
          <div className="label-mono absolute bg-background/90 px-2 py-1 text-foreground" style={{ left: pos.x + 10, top: pos.y + 10 }}>
            X {String(Math.round(pos.x)).padStart(4, "0")} · Y {String(Math.round(pos.y)).padStart(4, "0")}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────── Deportes: línea de pulso (telemetría) ───────────── */
const PULSE = "M0 60 H140 L155 60 L165 20 L178 100 L190 35 L200 60 H340 L355 60 L365 15 L378 105 L390 30 L400 60 H540 L555 60 L565 22 L578 98 L590 38 L600 60 H740 L755 60 L765 18 L778 102 L790 32 L800 60 H1000";
export function PulseSignature() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-50" />
      <svg className="absolute inset-x-0 bottom-[6%] h-36 w-full sm:bottom-[10%]" viewBox="0 0 1000 120" preserveAspectRatio="none" fill="none">
        <motion.path d={PULSE} stroke="hsl(var(--rock))" strokeWidth="1" {...draw(0.2, 2.4)} />
        {!reduce && (
          // Tramo naranja de ~11% de la longitud que recorre el trazo en bucle
          <motion.path
            d={PULSE}
            pathLength={1000}
            stroke="hsl(var(--signal))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="110 890"
            initial={{ strokeDashoffset: 1110, opacity: 0 }}
            animate={{ strokeDashoffset: [1110, 0], opacity: 1 }}
            transition={{ strokeDashoffset: { duration: 3.2, ease: "linear", repeat: Infinity, delay: 1.2 }, opacity: { delay: 1.2, duration: 0.3 } }}
          />
        )}
      </svg>
    </div>
  );
}

/* ───────────── Viajes: ruta de vuelo con avión recorriéndola ───────────── */
const ROUTE = "M60 330 C 260 60, 640 20, 940 170";
export function FlightSignature() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-x-0 top-[12%] hidden h-[62%] w-full sm:block" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet" fill="none">
        <motion.path id="flight-route" d={ROUTE} stroke="hsl(var(--rock))" strokeWidth="1" strokeDasharray="4 6" {...draw(0.3, 2.6)} />
        <motion.circle cx="60" cy="330" r="5" fill="hsl(var(--foreground))" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
        <motion.circle cx="940" cy="170" r="5" fill="none" stroke="hsl(var(--foreground))" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2 }} />
        <text x="76" y="352" className="fill-current font-mono text-[11px] text-muted-foreground">SLP · 22.15°N 100.98°W</text>
        <text x="924" y="200" textAnchor="end" className="fill-current font-mono text-[11px] text-muted-foreground">PRÓXIMO DESTINO · ??</text>
        {!reduce && (
          <g>
            <circle r="6" fill="hsl(var(--signal))">
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" begin="1.6s">
                <mpath href="#flight-route" />
              </animateMotion>
            </circle>
            <circle r="14" fill="hsl(var(--signal))" opacity="0.18">
              <animateMotion dur="7s" repeatCount="indefinite" begin="1.6s">
                <mpath href="#flight-route" />
              </animateMotion>
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ───────────── Galería: visor de cámara (REC + timecode) ───────────── */
export function ViewfinderSignature() {
  const [frames, setFrames] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrames((f) => f + 1), 1000 / 24);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor(frames / 24);
  const tc = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60, frames % 24].map((n) => String(n).padStart(2, "0")).join(":");
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-x-4 bottom-4 top-16 sm:inset-x-6 sm:bottom-6 sm:top-20"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOutExpo }}
      >
        <Brackets size={26} />
        <div className="label-mono absolute right-5 top-5 flex items-center gap-2 text-foreground">
          <span className="h-2 w-2 animate-blink rounded-full bg-signal" /> REC <span className="tabular-nums text-muted-foreground">{tc}</span>
        </div>
        <div className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-rock" />
        <div className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-rock" />
        <div className="label-mono absolute right-5 top-10 text-muted-foreground">ISO 200 · f/2.8 · 1/250</div>
      </motion.div>
    </div>
  );
}

/* ───────────── Lectura: texto que se ilumina palabra a palabra con el scroll ───────────── */
export function ScrollReadText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("relative", className)}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: ReturnType<typeof useScroll>["scrollYProgress"]; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/** Lectura: cursor de texto parpadeante tras el título. */
export function TypeCursorSignature() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,hsl(var(--rock)/0.25)_31px,hsl(var(--rock)/0.25)_32px)] mask-fade-b" />
    </div>
  );
}

/* ───────────── Inicio: retrato con parallax de cursor ───────────── */
export function useTilt(strength = 10) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), { stiffness: 200, damping: 20 });
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return { style: { rotateX: rx, rotateY: ry, transformPerspective: 900 }, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ───────────── Académico: fondo de fotos que se funden entre sí (Ken Burns) ───────────── */
export type Slide = { src: string; caption: string };

export function SlideshowSignature({ slides, interval = 5500 }: { slides: Slide[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [reduce, slides.length, interval]);
  const slide = slides[i % Math.max(slides.length, 1)];
  if (!slide) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 overflow-hidden opacity-[0.09] grayscale mask-fade-b sm:opacity-[0.12] dark:opacity-[0.18]">
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.src}
            src={slide.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1, transition: { opacity: { duration: 1.6 }, scale: { duration: interval / 1000 + 1.6, ease: "linear" } } }}
            exit={{ opacity: 0, transition: { duration: 1.6 } }}
          />
        </AnimatePresence>
      </div>
      {/* Pie de figura + marcador de diapositiva */}
      <div className="absolute inset-x-0 top-16 sm:top-20">
        <div className="page-container label-mono flex items-center justify-end gap-3 text-muted-foreground">
          <span className="text-foreground">Fig. {String(i + 1).padStart(2, "0")}</span>
          <span className="hidden max-w-[34ch] truncate sm:inline">{slide.caption}</span>
          <span className="flex gap-1">
            {slides.map((_, n) => (
              <span key={n} className={cn("h-px w-4 transition-colors duration-700", n === i ? "bg-signal" : "bg-rock")} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
