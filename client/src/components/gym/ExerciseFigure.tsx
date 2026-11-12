import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { MovementPattern } from "@shared/gym";

// Figura de palitos en vista lateral que alterna entre dos poses (inicio ↔ final del movimiento).
// Cada patrón define sus dos poses como coordenadas de articulaciones en un lienzo 120×120.

type Pt = [number, number];
type Pose = { H: Pt; S: Pt; E: Pt; W: Pt; P: Pt; K: Pt; F: Pt; K2?: Pt; F2?: Pt };
type Spec = { a: Pose; b: Pose; load?: { at: "W" | "F" | "K"; r: number }; prop?: "bench" | "longbench" | "incline" | "bar" | "dipbars" | "cable" | "sled" | "seat" };

const stand: Pose = { H: [60, 20], S: [60, 30], E: [60, 46], W: [62, 61], P: [60, 60], K: [60, 83], F: [60, 106] };

const SPECS: Record<MovementPattern, Spec> = {
  squat: {
    a: { ...stand, H: [60, 19], S: [60, 29], E: [52, 36], W: [57, 28], P: [60, 59], K: [61, 82] },
    b: { H: [68, 49], S: [62, 58], E: [54, 64], W: [60, 57], P: [48, 84], K: [74, 88], F: [60, 106] },
    load: { at: "W", r: 9 },
  },
  hinge: {
    a: { ...stand, E: [60, 45], W: [61, 60] },
    b: { H: [77, 46], S: [69, 52], E: [69, 68], W: [69, 82], P: [46, 70], K: [64, 87], F: [60, 106] },
    load: { at: "W", r: 9 },
  },
  legpress: {
    a: { H: [22, 46], S: [27, 56], E: [36, 70], W: [43, 77], P: [44, 80], K: [67, 70], F: [89, 60] },
    b: { H: [22, 46], S: [27, 56], E: [36, 70], W: [43, 77], P: [44, 80], K: [55, 56], F: [72, 58] },
    load: { at: "F", r: 10 }, prop: "sled",
  },
  lunge: {
    a: { ...stand, E: [60, 46], W: [60, 61], K: [64, 83], F: [66, 106], K2: [56, 83], F2: [52, 106] },
    b: { H: [60, 36], S: [60, 46], E: [60, 62], W: [60, 77], P: [60, 76], K: [78, 80], F: [80, 106], K2: [58, 100], F2: [38, 104] },
    load: { at: "W", r: 4 },
  },
  overhead: {
    a: { ...stand, E: [70, 42], W: [66, 30] },
    b: { ...stand, E: [62, 15], W: [61, 2] },
    load: { at: "W", r: 8 },
  },
  raise: {
    a: { ...stand, E: [61, 46], W: [62, 61] },
    b: { ...stand, E: [76, 31], W: [91, 31] },
    load: { at: "W", r: 4 },
  },
  curl: {
    a: { ...stand, E: [61, 46], W: [63, 61] },
    b: { ...stand, E: [61, 46], W: [71, 34] },
    load: { at: "W", r: 4 },
  },
  extension: {
    a: { ...stand, H: [63, 20], S: [62, 30], E: [64, 46], W: [76, 38] },
    b: { ...stand, H: [63, 20], S: [62, 30], E: [64, 46], W: [67, 62] },
    prop: "cable",
  },
  press: {
    a: { H: [20, 71], S: [30, 74], E: [32, 60], W: [31, 44], P: [64, 74], K: [85, 78], F: [90, 104] },
    b: { H: [20, 71], S: [30, 74], E: [39, 84], W: [33, 66], P: [64, 74], K: [85, 78], F: [90, 104] },
    load: { at: "W", r: 8 }, prop: "bench",
  },
  incline: {
    a: { H: [34, 49], S: [42, 58], E: [45, 43], W: [46, 28], P: [66, 80], K: [86, 76], F: [90, 104] },
    b: { H: [34, 49], S: [42, 58], E: [53, 66], W: [48, 50], P: [66, 80], K: [86, 76], F: [90, 104] },
    load: { at: "W", r: 8 }, prop: "incline",
  },
  dip: {
    a: { H: [62, 24], S: [60, 34], E: [61, 44], W: [60, 53], P: [60, 64], K: [57, 84], F: [66, 98] },
    b: { H: [64, 38], S: [60, 48], E: [46, 42], W: [60, 53], P: [58, 76], K: [55, 95], F: [64, 108] },
    prop: "dipbars",
  },
  pull: {
    a: { H: [66, 28], S: [60, 34], E: [60, 22], W: [60, 10], P: [60, 64], K: [60, 86], F: [58, 107] },
    b: { H: [66, 12], S: [60, 22], E: [47, 24], W: [60, 10], P: [60, 52], K: [60, 74], F: [58, 95] },
    prop: "bar",
  },
  row: {
    a: { H: [82, 42], S: [74, 48], E: [76, 64], W: [76, 80], P: [50, 66], K: [64, 86], F: [60, 106] },
    b: { H: [82, 42], S: [74, 48], E: [61, 56], W: [71, 65], P: [50, 66], K: [64, 86], F: [60, 106] },
    load: { at: "W", r: 7 },
  },
  legcurl: {
    // boca abajo en banco, flexión de rodilla
    a: { H: [20, 72], S: [30, 75], E: [26, 86], W: [18, 82], P: [62, 75], K: [84, 75], F: [106, 75] },
    b: { H: [20, 72], S: [30, 75], E: [26, 86], W: [18, 82], P: [62, 75], K: [84, 75], F: [92, 54] },
    load: { at: "F", r: 5 }, prop: "longbench",
  },
  legext: {
    // sentado, extensión de rodilla
    a: { H: [46, 36], S: [46, 46], E: [50, 62], W: [58, 78], P: [52, 78], K: [74, 78], F: [76, 100] },
    b: { H: [46, 36], S: [46, 46], E: [50, 62], W: [58, 78], P: [52, 78], K: [74, 78], F: [95, 72] },
    load: { at: "F", r: 5 }, prop: "seat",
  },
  calf: {
    // sentado, almohadilla sobre las rodillas: sube el talón
    a: { H: [44, 34], S: [44, 44], E: [52, 58], W: [64, 66], P: [46, 76], K: [70, 72], F: [72, 104] },
    b: { H: [44, 32], S: [44, 42], E: [52, 55], W: [64, 61], P: [46, 76], K: [70, 65], F: [74, 98] },
    load: { at: "K", r: 6 }, prop: "seat",
  },
  core: {
    a: { H: [22, 100], S: [32, 102], E: [34, 92], W: [24, 93], P: [58, 102], K: [74, 86], F: [88, 106] },
    b: { H: [34, 76], S: [40, 85], E: [47, 79], W: [37, 76], P: [58, 102], K: [74, 86], F: [88, 106] },
  },
};

const DUR = 1.5;

function Bone({ from, to, a, b, play, className, width = 3 }: { from: keyof Pose; to: keyof Pose; a: Pose; b: Pose; play: boolean; className?: string; width?: number }) {
  // Sin pierna trasera definida, se superpone a la delantera (K2→K, F2→F)
  const j = (pose: Pose, k: keyof Pose): Pt => pose[k] ?? pose[k === "K2" ? "K" : "F"]!;
  const A1 = j(a, from), A2 = j(a, to), B1 = j(b, from), B2 = j(b, to);
  return (
    <motion.line
      className={className}
      strokeWidth={width}
      strokeLinecap="round"
      initial={false}
      animate={play ? { x1: [A1[0], B1[0]], y1: [A1[1], B1[1]], x2: [A2[0], B2[0]], y2: [A2[1], B2[1]] } : { x1: A1[0], y1: A1[1], x2: A2[0], y2: A2[1] }}
      transition={play ? { duration: DUR, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", repeatDelay: 0.25 } : { duration: 0.4 }}
    />
  );
}

function Dot({ j, a, b, play, r, className }: { j: keyof Pose; a: Pose; b: Pose; play: boolean; r: number; className?: string }) {
  const A = a[j]!, B = b[j]!;
  return (
    <motion.circle
      r={r}
      className={className}
      initial={false}
      animate={play ? { cx: [A[0], B[0]], cy: [A[1], B[1]] } : { cx: A[0], cy: A[1] }}
      transition={play ? { duration: DUR, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", repeatDelay: 0.25 } : { duration: 0.4 }}
    />
  );
}

/** `active` fuerza la animación (p. ej. hover); si no, se anima solo mientras está en pantalla. */
export default function ExerciseFigure({ pattern, active, className }: { pattern: string; active?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const spec = SPECS[pattern as MovementPattern] ?? SPECS.curl;
  const play = !reduce && (active ?? inView);
  const { a, b } = spec;
  const p = { a, b, play };
  const bone = "stroke-foreground";

  return (
    <svg ref={ref} viewBox="0 0 120 120" className={className} fill="none" overflow="visible" aria-hidden>
      {/* suelo */}
      <line x1="8" y1="110" x2="112" y2="110" className="stroke-rock" strokeWidth="1" strokeDasharray="2 4" />

      {spec.prop === "bench" && <path d="M18 80 H74 M26 80 V110 M66 80 V110" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "longbench" && <path d="M10 82 H96 M18 82 V110 M88 82 V110" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "seat" && <path d="M40 80 H76 M44 80 V110 M72 80 V110 M40 80 L36 40" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "incline" && <path d="M34 54 L72 86 M70 86 V110 M48 70 V110" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "bar" && <path d="M30 9 H90 M34 9 V2 M86 9 V2" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "dipbars" && <path d="M38 54 H86 M44 54 V110 M80 54 V110" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "sled" && <path d="M16 84 L48 86 M20 50 L28 84 M96 40 L104 110" className="stroke-rock" strokeWidth="3" />}
      {spec.prop === "cable" && (
        <>
          <path d="M84 2 V110" className="stroke-rock" strokeWidth="3" />
          <motion.line
            x1={84} y1={8}
            className="stroke-rock" strokeWidth="1"
            initial={false}
            animate={play ? { x2: [a.W[0], b.W[0]], y2: [a.W[1], b.W[1]] } : { x2: a.W[0], y2: a.W[1] }}
            transition={play ? { duration: DUR, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", repeatDelay: 0.25 } : { duration: 0.4 }}
          />
        </>
      )}

      {/* pierna trasera (más tenue) */}
      <Bone from="P" to="K2" {...p} className="stroke-foreground/35" />
      <Bone from="K2" to="F2" {...p} className="stroke-foreground/35" />
      {/* cuerpo */}
      <Bone from="P" to="K" {...p} className={bone} />
      <Bone from="K" to="F" {...p} className={bone} />
      <Bone from="S" to="P" {...p} className={bone} width={3.5} />
      <Bone from="S" to="E" {...p} className={bone} />
      <Bone from="E" to="W" {...p} className={bone} />
      <Dot j="H" {...p} r={6} className="fill-background stroke-foreground [stroke-width:3]" />
      {spec.load && <Dot j={spec.load.at} {...p} r={spec.load.r} className="fill-signal/90 stroke-foreground [stroke-width:1.5]" />}
    </svg>
  );
}
