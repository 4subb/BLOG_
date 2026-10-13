import type { Transition, Variants } from "framer-motion";

// Curva "out-expo": arranque rápido, frenado largo y suave (la sensación Linear/Vercel).
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// Muelle corto y elástico para micro-interacciones (hover / tap).
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 26, mass: 0.6 };

// Muelle más suave para elementos que se desplazan (pill de navegación, layout).
export const springSoft: Transition = { type: "spring", stiffness: 300, damping: 30 };

// Transición de cambio de ruta. Solo opacidad + translateY: nada de `filter`,
// que convertiría el wrapper en containing block y rompería los `sticky`/`fixed` internos.
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: "easeIn" } },
};

export const staggerContainer = (stagger = 0.07, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

// Props listas para esparcir en un motion.* interactivo.
export const hoverLift = {
  whileHover: { y: -4, transition: springSnappy },
  whileTap: { scale: 0.985, transition: springSnappy },
};
