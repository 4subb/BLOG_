import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface StaggerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delay?: number;
  // true: anima al entrar en viewport (secciones bajo el pliegue). false: al montar.
  inView?: boolean;
}

/** Contenedor que revela a sus <StaggerItem> en cascada. */
export function Stagger({ stagger, delay, inView = false, children, ...props }: StaggerProps) {
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, amount: 0.15 } }
    : { animate: "show" };

  return (
    <motion.div variants={staggerContainer(stagger, delay)} initial="hidden" {...trigger} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}
