import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

interface PageHeaderProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

/** Cabecera de sección compartida: rejilla sutil de fondo + título con revelado en cascada. */
export default function PageHeader({ icon: Icon, eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div aria-hidden className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
      <Stagger className="page-container relative pt-16 pb-12 sm:pt-24 sm:pb-16" stagger={0.08}>
        {(Icon || eyebrow) && (
          <StaggerItem className="mb-5 flex items-center gap-2.5 text-sm text-muted-foreground">
            {Icon && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card shadow-xs">
                <Icon className="h-3.5 w-3.5 text-foreground" />
              </span>
            )}
            {eyebrow && <span className="font-mono text-xs uppercase tracking-[0.14em]">{eyebrow}</span>}
          </StaggerItem>
        )}
        <StaggerItem>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl">
            {title}
          </h1>
        </StaggerItem>
        {description && (
          <StaggerItem>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
          </StaggerItem>
        )}
        {children && <StaggerItem className="mt-8">{children}</StaggerItem>}
      </Stagger>
    </section>
  );
}
