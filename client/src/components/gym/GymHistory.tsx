import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Redo2, X } from "lucide-react";
import type { GymLog } from "@shared/schema";
import { fromKg } from "@shared/gym";
import { useLang } from "@/lib/lang";
import { easeOutExpo } from "@/lib/motion";
import { sameExercise } from "@shared/gym";
import LogEditor, { type LogFields } from "./LogEditor";
import type { GymApi } from "./useGym";

const dayKey = (d: string | Date) => new Date(d).toLocaleDateString("sv-SE");
const volume = (ls: GymLog[]) => ls.reduce((a, l) => a + l.weight * l.sets * l.reps, 0);

/** Resumen de hoy + días anteriores (los 14 más recientes, ampliable). */
export default function GymHistory({ gym }: { gym: GymApi }) {
  const { L, locale } = useLang();
  const [limit, setLimit] = useState(14);
  const [editing, setEditing] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const attempt = async (fn: () => Promise<unknown>) => {
    setFailed(false);
    try { await fn(); } catch { setFailed(true); }
  };
  const saveEdit = (l: GymLog, f: LogFields) => attempt(async () => {
    await gym.updateLog.mutateAsync({ id: l.id, ...f, ...(l.variantOf && sameExercise(f.exercise, l.variantOf) ? { variantOf: null } : {}) });
    setEditing(null);
  });

  const days = useMemo(() => {
    const map = new Map<string, GymLog[]>();
    for (const l of gym.logs) {
      const k = dayKey(l.date);
      map.set(k, [...(map.get(k) ?? []), l]);
    }
    return Array.from(map.entries());
  }, [gym.logs]);

  const bar = <TrashBar gym={gym} attempt={attempt} failed={failed} />;

  if (!days.length) {
    return <>{bar}<p className="border border-dashed border-rock/70 p-8 text-sm text-muted-foreground">{L("Aún no hay entrenamientos. Escribe el primero en el chat.", "No workouts yet. Log your first one in the chat.")}</p></>;
  }

  return (
    <div className="space-y-px">
      {bar}
      <AnimatePresence initial={false}>
        {days.slice(0, limit).map(([day, ls]) => (
          <motion.div
            key={day}
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="grid grid-cols-1 gap-4 border-t border-rock/70 py-5 sm:grid-cols-[180px_minmax(0,1fr)]"
          >
            <div>
              <p className="font-display text-lg font-semibold capitalize">
                {day === dayKey(new Date()) ? L("Hoy", "Today") : new Date(`${day}T12:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}
              </p>
              <p className="label-mono text-muted-foreground">{Math.round(fromKg(volume(ls), gym.unit)).toLocaleString(locale)} {gym.unit} · {ls.reduce((a, l) => a + l.sets, 0)} {L("series", "sets")}</p>
            </div>
            <ul className="divide-y divide-rock/40">
              <AnimatePresence initial={false}>
                {ls.map((l) => (
                  <motion.li
                    key={l.id}
                    layout
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex flex-wrap items-center justify-between gap-3 py-2 font-mono text-sm"
                  >
                    {editing === l.id ? (
                      <LogEditor gym={gym} value={l} onSave={(f) => saveEdit(l, f)} onCancel={() => setEditing(null)} />
                    ) : (<>
                    <span className="min-w-0 truncate font-semibold">
                      {l.exercise}
                      {l.variantOf && <span className="ml-2 text-[10px] font-normal text-muted-foreground">↔ {l.variantOf}</span>}
                    </span>
                    <span className="ml-auto text-muted-foreground">{l.sets}×{l.reps}</span>
                    <span className="w-20 text-right">{l.weight ? gym.w(l.weight) : "BW"}</span>
                    <span className="flex items-center gap-1 transition-opacity sm:opacity-40 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button onClick={() => setEditing(l.id)} className="p-1 text-muted-foreground transition-colors hover:text-foreground" aria-label={L("Corregir registro", "Edit entry")}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => attempt(() => gym.deleteLogs.mutateAsync([l.id]))} className="p-1 text-muted-foreground transition-colors hover:text-signal" aria-label={L("Borrar registro", "Delete entry")}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    </>)}
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

/** Lo último borrado, con botón para rehacer (y la lista de lo anterior). Se guarda en este navegador. */
function TrashBar({ gym, attempt, failed }: { gym: GymApi; attempt: (fn: () => Promise<unknown>) => Promise<void>; failed: boolean }) {
  const { L, locale } = useLang();
  const [open, setOpen] = useState(false);
  const list = open ? gym.trashed : gym.trashed.slice(0, 1);
  return (
    <div aria-live="polite">
      {failed && <p className="pb-3 text-sm text-signal">{L("No se pudo guardar el cambio. Inténtalo de nuevo.", "Couldn't save the change. Try again.")}</p>}
      {list.length > 0 && (
        <div className="mb-5 border border-dashed border-rock/70 px-4 py-3">
          <p className="label-mono mb-1 flex items-center justify-between gap-3 text-muted-foreground">
            {L("Eliminado recientemente", "Recently deleted")}
            {gym.trashed.length > 1 && (
              <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="hover:text-foreground">
                {open ? L("Ver menos", "Show less") : L(`Ver todo (${gym.trashed.length})`, `Show all (${gym.trashed.length})`)}
              </button>
            )}
          </p>
          <ul>
            {list.map((t) => (
              <li key={`${t.deletedAt}-${t.logs[0].id}`} className="flex items-center justify-between gap-3 py-1.5 font-mono text-sm">
                <span className="min-w-0 text-muted-foreground">
                  {t.logs.map((l) => `${l.exercise} ${l.sets}×${l.reps}${l.weight ? ` @ ${gym.w(l.weight)}` : ""}`).join(" · ")}
                  <span className="ml-2 text-[11px]">{new Date(t.logs[0].date).toLocaleDateString(locale, { day: "numeric", month: "short" })}</span>
                </span>
                <button
                  onClick={() => attempt(() => gym.restoreLogs.mutateAsync(t.logs))}
                  disabled={gym.restoreLogs.isPending}
                  className="label-mono inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground px-3 py-1 transition-colors hover:border-signal hover:text-signal disabled:opacity-40"
                >
                  <Redo2 className="h-3 w-3" /> {L("Restaurar", "Restore")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
