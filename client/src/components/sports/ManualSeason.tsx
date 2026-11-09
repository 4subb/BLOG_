import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MapPin } from "lucide-react";
import MiniCalendar from "@/components/MiniCalendar";
import { SectionHead } from "@/components/mission/primitives";
import { Flag } from "./Flag";
import type { SportKey } from "./media";
import { useLang, type Bi } from "@/lib/lang";

type Ranking = { id: string; rank: number; athleteName: string; points: number | null; teamName?: string | null; rankingName?: string };
type SportEvent = { id: string; eventName: string; date: string; location?: string };
// La API devuelve la columna como eventDate; el calendario espera date
type ApiEvent = Omit<SportEvent, "date" | "location"> & { eventDate?: string; date?: string; location?: string | null };

/*
 * Temporada de ciclismo y tenis con los datos que se capturan desde el panel (no hay API
 * gratuita oficial). Tenis añade la cita destacada del final de temporada.
 */
const HIGHLIGHT: Partial<Record<SportKey, { name: string; place: Bi; country: string; start: string; end: string; url: string; note: Bi }>> = {
  tenis: {
    name: "Nitto ATP Finals",
    place: { es: "Turín", en: "Turin" },
    country: "Italy",
    start: "2026-11-15T12:00:00+01:00",
    end: "2026-11-22T23:00:00+01:00",
    url: "https://www.nittoatpfinals.com/",
    note: {
      es: "Los 8 mejores del año: dos grupos, todos contra todos, semifinales y final. Fechas según el calendario ATP.",
      en: "The year's top 8: two round-robin groups, then semifinals and the final. Dates per the ATP calendar.",
    },
  },
};

const RANKING_TITLE: Partial<Record<SportKey, Bi>> = { ciclismo: { es: "Clasificación UCI", en: "UCI Ranking" }, tenis: { es: "Ranking ATP · WTA", en: "ATP · WTA Rankings" } };

export default function ManualSeason({ sport }: { sport: SportKey }) {
  const { data: rankings = [] } = useQuery<Ranking[]>({ queryKey: [`/api/public/rankings/${sport}`] });
  const { data: rawEvents = [] } = useQuery<ApiEvent[]>({ queryKey: [`/api/public/events/${sport}`] });
  const events: SportEvent[] = rawEvents.flatMap((e) => { const date = e.date ?? e.eventDate; return date ? [{ ...e, date, location: e.location ?? undefined }] : []; });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const highlight = HIGHLIGHT[sport];
  const { L, pick, locale } = useLang();

  const upcoming = events
    .filter((e) => new Date(e.date).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-20 sm:space-y-24">
      {highlight && <Highlight {...highlight} />}

      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="min-w-0 space-y-14 lg:col-span-8">
          <div>
            <SectionHead index="T.1" title={L("Próximos eventos", "Upcoming events")} aside={`${upcoming.length} ${L("en agenda", "scheduled")}`} className="mb-6" />
            {upcoming.length === 0 ? (
              <Empty text={L("Aún no hay eventos capturados. Agrégalos desde el panel de administración.", "No events yet. Add them from the admin dashboard.")} />
            ) : (
              <ul>
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => { const d = new Date(e.date); setCalendarDate(d); setSelectedDate(d); }}
                      className="flex w-full items-start justify-between gap-4 border-t border-rock/40 py-4 text-left transition-colors hover:text-signal"
                    >
                      <span>
                        <span className="font-medium">{e.eventName}</span>
                        {e.location && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {e.location}</span>}
                      </span>
                      <span className="label-mono shrink-0 text-muted-foreground">{new Date(e.date).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <SectionHead index="T.2" title={RANKING_TITLE[sport] ? pick(RANKING_TITLE[sport]!) : "Ranking"} className="mb-6" />
            {rankings.length === 0 ? (
              <Empty text={L("El ranking se publica cuando se captura desde el panel.", "The ranking appears once it is entered from the dashboard.")} />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {rankings.map((r) => (
                    <tr key={r.id} className="border-t border-rock/40">
                      <td className="label-mono w-10 py-3 text-muted-foreground">{String(r.rank).padStart(2, "0")}</td>
                      <td className="py-3"><span className="font-medium">{r.athleteName}</span>{r.teamName && <span className="ml-2 text-muted-foreground">{r.teamName}</span>}</td>
                      <td className="w-20 py-3 text-right font-display text-lg tabular-nums">{r.points ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <p className="label-mono mb-4 text-muted-foreground">{L("Calendario", "Calendar")}</p>
          <MiniCalendar events={events} currentDate={calendarDate} onDateChange={setCalendarDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </aside>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-rock/60 p-6 text-sm text-muted-foreground">{text}</p>;
}

function Highlight({ name, place, country, start, end, url, note }: NonNullable<(typeof HIGHLIGHT)[SportKey]>) {
  const [now, setNow] = useState(() => Date.now());
  const { L, pick, locale } = useLang();
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const live = now >= s && now <= e;
  const over = now > e;
  const diff = Math.max(0, s - now);
  const parts = [[L("días", "days"), Math.floor(diff / 86_400_000)], [L("horas", "hours"), Math.floor(diff / 3_600_000) % 24], ["min", Math.floor(diff / 60_000) % 60], [L("seg", "sec"), Math.floor(diff / 1000) % 60]] as const;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long" });

  return (
    <div className="grid gap-8 border border-foreground p-6 sm:p-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="label-mono flex items-center gap-2 text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full bg-signal ${live ? "animate-ping" : "animate-pulse"}`} />
          {live ? L("En juego ahora", "Live now") : over ? L("Terminado", "Finished") : L("Próximo gran evento", "Next big event")} · <Flag of={country} /> {pick(place)}
        </p>
        <h3 className="font-display mt-4 text-5xl sm:text-6xl">{name}</h3>
        <p className="label-mono mt-3 text-foreground">{fmt(start)} – {fmt(end)}</p>
        <p className="mt-5 max-w-[50ch] text-muted-foreground">{pick(note)}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="label-mono mt-6 inline-flex items-center gap-1.5 rounded-full border border-rock/60 px-4 py-2 transition-colors hover:border-signal hover:text-signal">
          {L("Sitio oficial", "Official site")} <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
      {!live && !over && (
        <div className="grid grid-cols-4 gap-3 self-end lg:col-span-5">
          {parts.map(([label, v]) => (
            <div key={label} className="border-t border-rock/60 pt-3">
              <p className="font-display text-4xl tabular-nums sm:text-5xl">{String(v).padStart(2, "0")}</p>
              <p className="label-mono mt-1 text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
