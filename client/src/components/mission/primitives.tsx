import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import { canUsePreciseLocation, locationLabel, requestPreciseLocation, useVisitorLocation } from "@/lib/location";
import { useLang } from "@/lib/lang";

/* ───────────────────────── SplitReveal ─────────────────────────
   Cada palabra sube desde detrás de una máscara (overflow hidden). */
export function SplitReveal({
  text, className, delay = 0, stagger = 0.06, inView = false,
}: { text: string; className?: string; delay?: number; stagger?: number; inView?: boolean }) {
  const words = text.split(" ");
  const trigger = inView ? { whileInView: "show", viewport: { once: true, amount: 0.5 } } : { animate: "show" };

  return (
    <motion.span
      className={cn("inline", className)}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      initial="hidden"
      {...trigger}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i}>
          {/* padding vertical para no recortar tildes (Á) ni descendentes (g, p) con line-height < 1 */}
          <span aria-hidden className="-mb-[0.1em] -mt-[0.14em] inline-block overflow-hidden pb-[0.1em] pt-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "115%" }, show: { y: "0%", transition: { duration: 1, ease: easeOutExpo } } }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}

/* ───────────────────────── Counter ─────────────────────────
   Cuenta desde 0 hasta `value` al entrar en pantalla. */
export function Counter({ value, pad = 0, duration = 1.8, className }: { value: number; pad?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setCurrent(value); return; }
    const controls = animate(0, value, { duration, ease: easeOutExpo, onUpdate: (v) => setCurrent(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return <span ref={ref} className={cn("tabular-nums", className)}>{String(current).padStart(pad, "0")}</span>;
}

/* ───────────────────────── Scramble ─────────────────────────
   Descifra el texto carácter a carácter (efecto terminal). */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_+";

export function useScramble(text: string) {
  const [output, setOutput] = useState(text);
  const frame = useRef<number>();
  const reduce = useReducedMotion();

  useEffect(() => setOutput(text), [text]);
  useEffect(() => () => cancelAnimationFrame(frame.current!), []);

  const play = useCallback(() => {
    if (reduce) return;
    cancelAnimationFrame(frame.current!);
    let tick = 0;
    const total = Math.min(28, text.length * 2 + 8);
    const step = () => {
      tick++;
      const revealed = (tick / total) * text.length;
      setOutput(text.split("").map((ch, i) =>
        ch === " " || i < revealed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      ).join(""));
      if (tick < total) frame.current = requestAnimationFrame(step);
      else setOutput(text);
    };
    frame.current = requestAnimationFrame(step);
  }, [text, reduce]);

  return [output, play] as const;
}

/** Texto que se descifra al montar y al pasar el cursor. */
export function Scramble({ text, className, onMount = false }: { text: string; className?: string; onMount?: boolean }) {
  const [output, play] = useScramble(text);
  useEffect(() => { if (onMount) play(); }, [onMount, play]);
  return <span className={className} onMouseEnter={play} aria-label={text}><span aria-hidden>{output}</span></span>;
}

/* ───────────────────────── Rule ─────────────────────────
   Línea horizontal que se dibuja de izquierda a derecha. */
export function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={cn("h-px origin-left bg-rock/70", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.3, ease: easeOutExpo, delay }}
    />
  );
}

/* ───────────────────────── SectionHead ─────────────────────────
   Cabecera de sección: regla + índice + título mono + acción opcional. */
export function SectionHead({ index, title, aside, className }: { index: string; title: string; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Rule />
      <div className="flex items-baseline justify-between gap-6 pt-4">
        <p className="label-mono text-muted-foreground">
          <span className="text-foreground">({index})</span>
          <span className="ml-3">{title}</span>
        </p>
        {aside && <div className="label-mono text-muted-foreground">{aside}</div>}
      </div>
    </div>
  );
}

/* ───────────────────────── SpecSheet ─────────────────────────
   Ficha técnica clave/valor estilo hoja de datos. */
export type Spec = { label: string; value: number | string; pad?: number; unit?: string };

export function SpecSheet({ specs, className }: { specs: Spec[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 sm:gap-x-10", className)}>
      {specs.map((spec, i) => (
        <div key={spec.label} className="pb-6">
          <Rule delay={0.15 + i * 0.08} />
          <dt className="label-mono pt-3 text-muted-foreground">{spec.label}</dt>
          <dd className="font-display mt-3 text-4xl sm:text-5xl">
            {typeof spec.value === "number" ? <Counter value={spec.value} pad={spec.pad} /> : spec.value}
            {spec.unit && <span className="label-mono ml-2 align-top text-muted-foreground">{spec.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ───────────────────────── LiveClock ─────────────────────────
   Ciudad y hora local del visitante, como telemetría. La ciudad sale de su IP (sin permisos);
   al pulsarla se puede pedir la ubicación exacta al navegador. */
export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState(() => new Date());
  const [locating, setLocating] = useState(false);
  const geo = useVisitorLocation();
  const { L, locale } = useLang();
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // Sin timeZone: la hora del dispositivo, que ya es la del lugar donde está el visitante
  const time = now.toLocaleTimeString(locale, { hour12: false });
  const label = locationLabel(geo);
  const askPrecise = !geo?.precise && canUsePreciseLocation();

  const locate = () => {
    setLocating(true);
    requestPreciseLocation().catch(() => {}).finally(() => setLocating(false));
  };

  return (
    <span className={cn("tabular-nums", className)}>
      <span className={cn("mr-2 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle", locating ? "animate-ping" : "animate-pulse")} />
      {askPrecise ? (
        <button
          type="button"
          onClick={locate}
          title={L("Usar mi ubicación exacta", "Use my exact location")}
          className="uppercase tracking-[inherit] underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {label}
        </button>
      ) : (
        label
      )}
      {" · "}{time}
    </span>
  );
}

/* ───────────────────────── GhostWord ─────────────────────────
   Palabra gigante de fondo que se desplaza en horizontal con el scroll. */
export function GhostWord({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-18%"]);
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none relative select-none overflow-hidden", className)}>
      <motion.p style={{ x }} className="font-display whitespace-nowrap text-[clamp(7rem,24vw,26rem)] leading-[0.78] text-ghost">
        {text}
      </motion.p>
    </div>
  );
}

/* ───────────────────────── Brackets ─────────────────────────
   Esquinas de visor que encuadran un elemento. */
export function Brackets({ className, size = 14 }: { className?: string; size?: number }) {
  const s = `${size}px`;
  const corner = "absolute border-foreground/70";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn(corner, "left-0 top-0 border-l border-t")} style={{ width: s, height: s }} />
      <span className={cn(corner, "right-0 top-0 border-r border-t")} style={{ width: s, height: s }} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l")} style={{ width: s, height: s }} />
      <span className={cn(corner, "bottom-0 right-0 border-b border-r")} style={{ width: s, height: s }} />
    </div>
  );
}
