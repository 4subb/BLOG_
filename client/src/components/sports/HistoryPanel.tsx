import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Counter, SectionHead } from "@/components/mission/primitives";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { HISTORY } from "./history";
import { HISTORY_EN, TAG_EN } from "./history.en";
import type { SportKey } from "./media";
import { useLang } from "@/lib/lang";

export type LiveFact = { k: string; title: string; body: string };

/**
 * Subapartado "Historia" de cada deporte: línea de tiempo navegable con momentos memorables,
 * tarjetas "¿Sabías que?" que se voltean y una franja de récords.
 * `live` añade al inicio datos calculados de la temporada actual (p. ej. récords que se están rompiendo).
 */
export default function HistoryPanel({ sport, live = [] }: { sport: SportKey; live?: LiveFact[] }) {
  const { L, es } = useLang();
  const h = (es ? HISTORY : HISTORY_EN)[sport];
  const [i, setI] = useState(h.moments.length - 1);
  const [dir, setDir] = useState(1);
  const m = h.moments[i];

  const go = (next: number) => {
    const clamped = (next + h.moments.length) % h.moments.length;
    setDir(clamped > i ? 1 : -1);
    setI(clamped);
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {live.length > 0 && (
        <div>
          <SectionHead index="H.0" title={L("Esta temporada, en la historia", "This season, in history")} className="mb-8" />
          <div className={cn("grid gap-px bg-rock/40 sm:grid-cols-2", live.length === 3 && "lg:grid-cols-3")}>
            {live.map((f) => (
              <article key={f.title} className="bg-background p-6">
                <p className="font-display text-5xl text-signal">{f.k}</p>
                <h5 className="mt-4 font-medium">{f.title}</h5>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Línea de tiempo */}
      <div>
        <SectionHead index="H.1" title={L("Momentos memorables", "Memorable moments")} aside={`${String(i + 1).padStart(2, "0")}/${String(h.moments.length).padStart(2, "0")}`} className="mb-4" />
        <p className="mb-10 max-w-[60ch] text-muted-foreground">{h.intro}</p>

        <div className="relative mb-10">
          <div className="absolute inset-x-0 top-1/2 h-px bg-rock/60" />
          <motion.div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-signal"
            animate={{ width: `${(i / Math.max(1, h.moments.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          />
          <ol className="relative flex justify-between">
            {h.moments.map((mo, j) => (
              <li key={mo.year}>
                <button
                  type="button"
                  onClick={() => go(j)}
                  className="group flex flex-col items-center gap-2"
                  aria-label={`${mo.year}: ${mo.title}`}
                  aria-current={j === i}
                >
                  <span className={cn("block h-3 w-3 rounded-full border-2 transition-all", j === i ? "scale-125 border-signal bg-signal" : j < i ? "border-signal bg-background" : "border-rock bg-background group-hover:border-foreground")} />
                  <span className={cn("label-mono transition-colors", j === i ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{mo.year}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative overflow-hidden border border-rock/50">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.article
              key={m.year}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: `${d * 12}%`, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: `${d * -12}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: easeOutExpo }}
              className="relative grid gap-8 p-6 pb-20 sm:p-10 sm:pb-20 lg:grid-cols-12"
            >
              <p aria-hidden className="pointer-events-none absolute -bottom-6 -right-2 font-display text-[clamp(7rem,20vw,16rem)] leading-none text-foreground/[0.06]">{m.year}</p>
              <div className="lg:col-span-4">
                <span className="label-mono inline-block rounded-full border border-foreground px-3 py-1">{es ? m.tag : TAG_EN[m.tag]}</span>
                <p className="font-display mt-6 text-6xl sm:text-7xl">{m.year}</p>
              </div>
              <div className="relative lg:col-span-8">
                <h4 className="font-display text-3xl sm:text-4xl">{m.title}</h4>
                <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">{m.body}</p>
                <p className="mt-6 flex gap-3 border-l-2 border-signal pl-4 text-foreground">{m.why}</p>
              </div>
            </motion.article>
          </AnimatePresence>
          <div className="absolute bottom-4 left-4 flex gap-2 sm:left-10">
            <NavBtn onClick={() => go(i - 1)} label={L("Anterior", "Previous")}><ChevronLeft className="h-4 w-4" /></NavBtn>
            <NavBtn onClick={() => go(i + 1)} label={L("Siguiente", "Next")}><ChevronRight className="h-4 w-4" /></NavBtn>
          </div>
        </div>
      </div>

      {/* ¿Sabías que? */}
      <div>
        <SectionHead index="H.2" title={L("¿Sabías que?", "Did you know?")} aside={L("toca para revelar", "tap to reveal")} className="mb-8" />
        <div className="grid gap-4 md:grid-cols-3">
          {h.trivia.map((t) => <TriviaCard key={t.q} q={t.q} a={t.a} />)}
        </div>
      </div>

      {/* Récords */}
      <div>
        <SectionHead index="H.3" title={L("Récords", "Records")} className="mb-8" />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {h.records.map((r) => (
            <div key={r.value} className="border-t border-rock/60 pt-4">
              <dd className="font-display text-5xl sm:text-6xl">
                <Counter value={r.value} />{r.suffix && <span className="text-muted-foreground">{r.suffix}</span>}
              </dd>
              <dt className="mt-3 font-medium">{r.label}</dt>
              <p className="label-mono mt-1 text-muted-foreground">{r.who}</p>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function NavBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-rock/60 bg-background transition-colors hover:border-signal hover:text-signal">
      {children}
    </button>
  );
}

function TriviaCard({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const { L } = useLang();
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="group relative h-56 text-left [perspective:1200px]"
    >
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        animate={{ rotateY: open ? 180 : 0 }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
      >
        <div className="absolute inset-0 flex flex-col justify-between border border-rock/60 bg-muted/50 p-6 [backface-visibility:hidden]">
          <span className="font-display text-5xl text-signal">?</span>
          <p className="text-lg font-medium leading-snug">{q}</p>
          <span className="label-mono text-muted-foreground transition-colors group-hover:text-foreground">{L("Revelar →", "Reveal →")}</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between border border-foreground bg-foreground p-6 text-background [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="label-mono text-background/60">{L("Respuesta", "Answer")}</span>
          <p className="leading-relaxed">{a}</p>
          <span className="label-mono text-background/60">{L("← Volver", "← Back")}</span>
        </div>
      </motion.div>
    </button>
  );
}
