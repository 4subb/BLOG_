import type { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { easeOutExpo } from "@/lib/motion";

/** Marco de las páginas de acceso (se renderizan sin header/footer). */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-16">
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Inicio
        </Link>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="relative w-full max-w-sm"
      >
        <Link href="/" className="mx-auto mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
          ÁS
        </Link>
        <div className="space-y-8 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
