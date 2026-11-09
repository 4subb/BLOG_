import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Lienzo común de las escenas: 1200×420 (20:7). */
export const W = 1200;
export const H = 420;

/** PRNG determinista (mulberry32): mismas "multitudes" y árboles en cada render. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Pt = [number, number];

/** Curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos. */
export function smoothPath(pts: Pt[], closed = false, tension = 0.5) {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const f = (v: number) => +v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const k = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + " Z" : d;
}

/** Marco de cada escena: esquinas redondeadas, borde de regla y etiqueta mono de ubicación. */
export function SceneFrame({ label, coords, children, className }: { label: string; coords: string; children: ReactNode; className?: string }) {
  return (
    <figure
      className={cn(
        "scene relative mb-8 aspect-[20/7] w-full overflow-hidden rounded-xl border border-rock/50 [container-type:inline-size] dark:brightness-[0.82] dark:saturate-[0.9]",
        className,
      )}
    >
      {children}
      <figcaption className="label-mono pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[10px] text-white backdrop-blur-sm sm:left-4 sm:top-4">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
        {label}
        <span className="hidden text-white/60 sm:inline">· {coords}</span>
      </figcaption>
    </figure>
  );
}

/** CSS que todas las escenas comparten: pausa con reduced-motion. */
export const REDUCED_CSS = `
@media (prefers-reduced-motion: reduce) {
  .scene *, .scene *::before, .scene *::after { animation: none !important; }
}`;
