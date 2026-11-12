import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { GymLog } from "@shared/schema";
import { formatKg } from "@shared/gym";
import { useLang } from "@/lib/lang";
import { easeOutExpo } from "@/lib/motion";
import type { GymApi } from "./useGym";

const dayKey = (d: string | Date) => new Date(d).toLocaleDateString("sv-SE");
const volume = (ls: GymLog[]) => ls.reduce((a, l) => a + l.weight * l.sets * l.reps, 0);

/** Resumen de hoy + días anteriores (los 14 más recientes, ampliable). */
export default function GymHistory({ gym }: { gym: GymApi }) {
  const { L, locale } = useLang();
  const [limit, setLimit] = useState(14);

  const days = useMemo(() => {
    const map = new Map<string, GymLog[]>();
    for (const l of gym.logs) {
      const k = dayKey(l.date);
      map.set(k, [...(map.get(k) ?? []), l]);
    }
    return Array.from(map.entries());
  }, [gym.logs]);

  if (!days.length) {
    return <p className="border border-dashed border-rock/70 p-8 text-sm text-muted-foreground">{L("Aún no hay entrenamientos. Escribe el primero en el chat.", "No workouts yet. Log your first one in the chat.")}</p>;
  }

  return (
    <div className="space-y-px">
      <AnimatePresence initial={false}>
        {days.slice(0, limit).map(([day, ls]) => (
          <motion.div
            key={day}
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="grid gap-4 border-t border-rock/70 py-5 sm:grid-cols-[180px_1fr]"
          >
            <div>
              <p className="font-display text-lg font-semibold capitalize">
                {day === dayKey(new Date()) ? L("Hoy", "Today") : new Date(`${day}T12:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}
              </p>
              <p className="label-mono text-muted-foreground">{volume(ls).toLocaleString(locale)} kg · {ls.reduce((a, l) => a + l.sets, 0)} {L("series", "sets")}</p>
            </div>
            <ul className="divide-y divide-rock/40">
              <AnimatePresence initial={false}>
                {ls.map((l) => (
                  <motion.li
                    key={l.id}
                    layout
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center justify-between gap-3 py-2 font-mono text-sm"
                  >
                    <span className="truncate font-semibold">{l.exercise}</span>
                    <span className="ml-auto text-muted-foreground">{l.sets}×{l.reps}</span>
                    <span className="w-20 text-right">{l.weight ? `${formatKg(l.weight)} kg` : "BW"}</span>
                    <button
                      onClick={() => gym.deleteLogs.mutate([l.id])}
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-signal group-hover:opacity-100 focus:opacity-100"
                      aria-label={L("Borrar registro", "Delete entry")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        ))}
      </AnimatePresence>
      {days.length > limit && (
        <button onClick={() => setLimit((n) => n + 14)} className="label-mono mt-4 text-muted-foreground hover:text-foreground">
          {L("Ver más días →", "More days →")}
        </button>
      )}
    </div>
  );
}
