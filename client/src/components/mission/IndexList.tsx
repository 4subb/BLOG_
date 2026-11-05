import { useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { easeOutExpo, fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type IndexRow = {
  key: string;
  href: string;
  index: string;
  title: string;
  meta?: string;
  image?: string;
};

/**
 * Índice editorial en filas grandes. Al pasar el cursor, una vista previa de la imagen
 * aparece y lo sigue con un muelle (desktop). Firma visual de Inicio / Viajes / Lectura.
 */
export default function IndexList({ rows, size = "lg" }: { rows: IndexRow[]; size?: "lg" | "md" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const activeImage = active !== null ? rows[active]?.image : undefined;

  return (
    <div ref={ref} className="relative" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <motion.ul variants={staggerContainer(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        {rows.map((row, i) => (
          <motion.li key={row.key} variants={fadeUp}>
            <Link
              href={row.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group relative grid grid-cols-12 items-baseline gap-x-4 border-t border-rock/50 py-6 outline-none sm:py-8"
            >
              {/* Barrido de fondo al hover */}
              <span aria-hidden className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-muted transition-transform duration-500 ease-out-expo group-hover:scale-y-100 group-focus-visible:scale-y-100" />
              <span className="label-mono col-span-2 text-muted-foreground transition-colors group-hover:text-signal sm:col-span-1">{row.index}</span>
              <span
                className={cn(
                  "font-display col-span-10 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 sm:col-span-8",
                  size === "lg" ? "text-[clamp(2rem,5.5vw,4.75rem)]" : "text-[clamp(1.6rem,3.6vw,3rem)]",
                )}
              >
                {row.title}
              </span>
              <span className="label-mono col-span-10 col-start-3 mt-3 text-muted-foreground sm:col-span-2 sm:col-start-auto sm:mt-0">{row.meta}</span>
              <span className="col-span-1 hidden justify-end sm:flex">
                <ArrowUpRight className="h-6 w-6 text-muted-foreground transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:text-signal" />
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
      <div className="border-t border-rock/50" />

      {/* Vista previa flotante */}
      <motion.div style={{ x: sx, y: sy }} className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block">
        <AnimatePresence>
          {activeImage && (
            <motion.div
              key={activeImage}
              className="absolute -left-36 -top-28 h-56 w-72 overflow-hidden bg-muted shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, clipPath: "inset(50% 0% 50% 0%)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ duration: 0.55, ease: easeOutExpo }}
            >
              <img src={activeImage} alt="" className="h-full w-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
