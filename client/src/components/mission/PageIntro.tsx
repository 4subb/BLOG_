import { LiveClock, SplitReveal } from "./primitives";

/** Cabecera compacta para páginas de herramienta (perfil, panel, editor): misma telemetría y titular. */
export default function PageIntro({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div className="mb-14 border-b border-rock/40 pb-10">
      <div className="label-mono flex items-center justify-between gap-4 text-muted-foreground">
        <span>
          <span className="text-foreground">[{index}]</span>
          <span className="mx-2">/</span>
          {label}
        </span>
        <LiveClock className="hidden sm:inline" />
      </div>
      <h1 className="font-display mt-12 text-[clamp(2.75rem,7vw,6rem)]">
        <SplitReveal text={title} />
      </h1>
    </div>
  );
}
