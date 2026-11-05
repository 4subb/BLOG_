import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { LiveClock, SplitReveal } from "@/components/mission/primitives";
import { PulseSignature } from "@/components/mission/signatures";
import { easeOutExpo } from "@/lib/motion";
import { locationLabel, useVisitorLocation } from "@/lib/location";

/** Marco de las páginas de acceso (sin header/footer): panel de misión a la izquierda, formulario a la derecha. */
export default function AuthShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const geo = useVisitorLocation();
  const isRegister = location === "/register";

  return (
    <div className="grid flex-1 lg:grid-cols-2">
      {/* Panel de misión */}
      <div className="relative isolate hidden flex-col justify-between overflow-hidden border-r border-rock/40 bg-muted/40 p-10 lg:flex">
        <div className="absolute inset-0 -z-10 opacity-70"><PulseSignature /></div>
        <div className="label-mono flex items-center justify-between text-muted-foreground">
          <Link href="/" className="text-foreground hover:text-signal">Ángel Subías</Link>
          <LiveClock />
        </div>
        <div>
          <p className="label-mono text-muted-foreground">[{isRegister ? "R1" : "L1"}] / {isRegister ? "Registro" : "Acceso"}</p>
          <h1 className="font-display mt-8 text-[clamp(3.5rem,6.2vw,7rem)]">
            <SplitReveal text={isRegister ? "Únete a la misión" : "Bienvenido de vuelta"} />
          </h1>
        </div>
        <p className="label-mono text-muted-foreground">Sesión cifrada · TLS · {locationLabel(geo)}</p>
      </div>

      {/* Formulario */}
      <div className="relative flex flex-col items-center justify-center px-5 py-20">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="label-mono group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" /> Inicio
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
          className="w-full max-w-sm space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
