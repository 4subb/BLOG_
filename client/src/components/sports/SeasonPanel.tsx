import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpRight, MapPin, Star } from "lucide-react";
import type { SeasonEvent, SeasonFeed, SeasonMatch } from "@shared/season";
import MiniCalendar from "@/components/MiniCalendar";
import { SectionHead } from "@/components/mission/primitives";
import { Flag } from "./Flag";
import type { SportKey } from "./media";
import { useLang } from "@/lib/lang";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";

/*
 * Temporada de tenis y ciclismo desde /api/season/:sport. Tenis llega en vivo (ESPN) y la página
 * se refresca sola: cada minuto si hay partidos en juego, cada 10 si no. Ciclismo es curado + panel.
 */
const hasLive = (f?: SeasonFeed) => !!f && (f.matches.some((m) => m.state === "in") || f.highlight?.status === "in");

export function useSeason(sport: SportKey) {
  return useQuery<SeasonFeed>({
    queryKey: [`/api/season/${sport}`],
    refetchInterval: (q) => (hasLive(q.state.data) ? 60_000 : 10 * 60_000),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    retry: 1,
  });
}

export default function SeasonPanel({ sport }: { sport: SportKey }) {
  const { data, isLoading, isError, dataUpdatedAt } = useSeason(sport);
  const { L } = useLang();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  if (isLoading) return <div className="h-96 animate-pulse border border-rock/40" aria-busy />;
  if (isError || !data) return <Empty text={L("No se pudo cargar la temporada. Se reintenta solo en unos minutos.", "Couldn't load the season. It retries automatically in a few minutes.")} />;

  const calEvents = data.events.map((e) => ({ id: e.id, eventName: e.name, date: e.start, location: e.location ?? undefined }));
  const pickDate = (iso: string) => { const d = new Date(iso); setCalendarDate(d); setSelectedDate(d); };

  return (
    <div className="space-y-20 sm:space-y-24">
      <SourceBar feed={data} fetchedAt={dataUpdatedAt} />
      {data.highlight && <Highlight ev={data.highlight} matches={data.matches} />}
      {data.recap && <Recap recap={data.recap} />}

      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="min-w-0 space-y-14 lg:col-span-8">
          <Upcoming events={data.events} onPick={pickDate} />
          <Rankings feed={data} />
        </div>
        <aside className="lg:col-span-4">
          <p className="label-mono mb-4 text-muted-foreground">{L("Calendario", "Calendar")}</p>
          <MiniCalendar events={calEvents} currentDate={calendarDate} onDateChange={setCalendarDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </aside>
      </div>
    </div>
  );
}

/** De dónde salen los datos y cuándo se actualizaron */
function SourceBar({ feed, fetchedAt }: { feed: SeasonFeed; fetchedAt: number }) {
  const { L, locale } = useLang();
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(id); }, []);
  const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60_000));
  const live = hasLive(feed);
  return (
    <p className="label-mono -mb-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground sm:-mb-14">
      {feed.source.live ? (
        <span className="flex items-center gap-1.5 text-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-signal", live ? "animate-ping" : "animate-pulse")} />
          {live ? L("En vivo · se actualiza cada minuto", "Live · updates every minute") : L("Datos en vivo · se actualiza solo", "Live data · updates automatically")}
        </span>
      ) : (
        <span>{L("Datos revisados a mano", "Hand-checked data")} · {new Date(feed.updatedAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}</span>
      )}
      <span>·</span>
      <a href={feed.source.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">{L("Fuente", "Source")}: {feed.source.name}</a>
      {feed.source.live && <><span>·</span><span>{mins === 0 ? L("actualizado ahora", "updated just now") : L(`hace ${mins} min`, `${mins} min ago`)}</span></>}
    </p>
  );
}

function Highlight({ ev, matches }: { ev: NonNullable<SeasonFeed["highlight"]>; matches: SeasonMatch[] }) {
  const { L, pick, locale } = useLang();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const s = new Date(ev.start).getTime();
  const live = ev.status === "in";
  const over = ev.status === "post";
  const diff = Math.max(0, s - now);
  const parts = [[L("días", "days"), Math.floor(diff / 86_400_000)], [L("horas", "hours"), Math.floor(diff / 3_600_000) % 24], ["min", Math.floor(diff / 60_000) % 60], [L("seg", "sec"), Math.floor(diff / 1000) % 60]] as const;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long" });
  // Partidos: los de la ronda más avanzada que tenga datos, más los que estén en juego
  const shown = matches.filter((m) => m.state === "in" || m.round === matches[0]?.round || m.round === "Semifinal").slice(0, 6);

  return (
    <div className="grid gap-8 border border-foreground p-6 sm:p-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="label-mono flex flex-wrap items-center gap-2 text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full bg-signal", live ? "animate-ping" : "animate-pulse")} />
          {live ? L("En juego ahora", "Live now") : over ? L("Terminado", "Finished") : L("Próximo gran evento", "Next big event")}
          {ev.location && <> · {ev.country && <Flag of={ev.country} />} {ev.location}</>}
          {ev.tour && <> · {ev.tour}</>}
        </p>
        <h3 className="font-display mt-4 text-4xl sm:text-6xl">{ev.name}</h3>
        <p className="label-mono mt-3 text-foreground">{fmt(ev.start)} – {fmt(ev.end)}</p>
        {ev.note && <p className="mt-5 max-w-[52ch] text-muted-foreground">{pick(ev.note)}</p>}
        {ev.url && (
          <a href={ev.url} target="_blank" rel="noopener noreferrer" className="label-mono mt-6 inline-flex items-center gap-1.5 rounded-full border border-rock/60 px-4 py-2 transition-colors hover:border-signal hover:text-signal">
            {L("Sitio oficial", "Official site")} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="self-end lg:col-span-5">
        {shown.length > 0 ? (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {shown.map((m) => <MatchRow key={m.id} m={m} />)}
            </AnimatePresence>
          </ul>
        ) : !live && !over ? (
          <div className="grid grid-cols-4 gap-3">
            {parts.map(([label, v]) => (
              <div key={label} className="border-t border-rock/60 pt-3">
                <p className="font-display text-4xl tabular-nums sm:text-5xl">{String(v).padStart(2, "0")}</p>
                <p className="label-mono mt-1 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MatchRow({ m }: { m: SeasonMatch }) {
  const { L, locale } = useLang();
  const when = m.state === "pre"
    ? new Date(m.date).toLocaleString(locale, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : m.state === "in" ? L("En juego", "Live") : L("Terminado", "Finished");
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: easeOutExpo }}
      className={cn("border-t border-rock/60 pt-3", m.state === "in" && "border-signal")}>
      <p className="label-mono mb-1.5 flex justify-between gap-2 text-muted-foreground">
        <span>{m.round} · {m.draw}</span>
        <span className={cn(m.state === "in" && "text-signal")}>{when}</span>
      </p>
      {m.players.map((p) => (
        <div key={p.name} className={cn("flex items-center justify-between gap-3 py-0.5", m.state === "post" && !p.winner && "text-muted-foreground")}>
          <span className="flex min-w-0 items-center gap-2">
            {p.country && <Flag of={p.country} />}
            <span className={cn("truncate", p.winner && "font-semibold")}>{p.name}</span>
          </span>
          <span className="flex gap-2 font-mono tabular-nums">
            {p.sets.map((v, i) => (
              <span key={i} className="w-4 text-right">{v ?? ""}{p.tiebreaks[i] !== null && p.tiebreaks[i] !== undefined && <sup className="text-[9px] text-muted-foreground">{p.tiebreaks[i]}</sup>}</span>
            ))}
          </span>
        </div>
      ))}
    </motion.li>
  );
}

function Recap({ recap }: { recap: NonNullable<SeasonFeed["recap"]> }) {
  const { pick, L } = useLang();
  return (
    <div>
      <SectionHead index="T.0" title={pick(recap.title)} className="mb-6" />
      <ul className="grid gap-px border border-rock/60 bg-rock/60 sm:grid-cols-2">
        {recap.lines.map((l, i) => (
          <li key={i} className="flex gap-3 bg-background p-5 text-sm">
            <span className="label-mono text-signal">{String(i + 1).padStart(2, "0")}</span>{pick(l)}
          </li>
        ))}
      </ul>
      <p className="label-mono mt-3 flex flex-wrap gap-x-3 text-muted-foreground">
        {L("Fuentes", "Sources")}:
        {recap.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-signal">{s.name}</a>)}
      </p>
    </div>
  );
}

function Upcoming({ events, onPick }: { events: SeasonEvent[]; onPick: (iso: string) => void }) {
  const { L, locale } = useLang();
  const [all, setAll] = useState(false);
  const [onlyMajor, setOnlyMajor] = useState(false);
  const list = events.filter((e) => !onlyMajor || e.major);
  const shown = all ? list : list.slice(0, 8);
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" }).replace(".", "");
  const sameDay = (e: SeasonEvent) => e.start.slice(0, 10) === e.end.slice(0, 10);

  return (
    <div>
      <SectionHead
        index="T.1"
        title={L("Próximos eventos", "Upcoming events")}
        aside={
          <button onClick={() => setOnlyMajor((v) => !v)} className={cn("label-mono inline-flex items-center gap-1 transition-colors", onlyMajor ? "text-signal" : "hover:text-foreground")}>
            <Star className={cn("h-3 w-3", onlyMajor && "fill-current")} /> {L("Solo los grandes", "Majors only")}
          </button>
        }
        className="mb-6"
      />
      {list.length === 0 ? <Empty text={L("No hay eventos próximos.", "No upcoming events.")} /> : (
        <ul>
          {shown.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => onPick(e.start)}
                className="flex w-full items-start justify-between gap-4 border-t border-rock/40 py-4 text-left transition-colors hover:text-signal">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium">
                    {e.major && <Star className="h-3.5 w-3.5 shrink-0 fill-signal text-signal" />}
                    {e.status === "in" && <span className="label-mono rounded-full bg-signal px-2 py-0.5 text-white">{L("en juego", "live")}</span>}
                    <span className="truncate">{e.name}</span>
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {(e.location || e.country) && <><MapPin className="h-3 w-3" />{e.country && <Flag of={e.country} />} {e.location}</>}
                    {e.tour && <span className="label-mono">· {e.tour}</span>}
                  </span>
                </span>
                <span className="label-mono shrink-0 text-right text-muted-foreground">{fmt(e.start)}{!sameDay(e) && <> – {fmt(e.end)}</>}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {list.length > 8 && (
        <button onClick={() => setAll((v) => !v)} className="label-mono mt-4 text-muted-foreground transition-colors hover:text-foreground">
          {all ? L("Ver menos", "Show less") : L(`Ver todo el calendario (${list.length})`, `Show full calendar (${list.length})`)}
        </button>
      )}
    </div>
  );
}

function Rankings({ feed }: { feed: SeasonFeed }) {
  const { L, locale } = useLang();
  const [tab, setTab] = useState(0);
  const [more, setMore] = useState(false);
  const r = feed.rankings[tab];
  const title = feed.sport === "tenis" ? L("Ranking ATP · WTA", "ATP · WTA Rankings") : L("Clasificación UCI", "UCI Ranking");

  return (
    <div>
      <SectionHead
        index="T.2"
        title={title}
        aside={r?.asOf ? `${L("Al", "As of")} ${new Date(r.asOf).toLocaleDateString(locale, { day: "numeric", month: "short" })}` : undefined}
        className="mb-6"
      />
      {feed.rankings.length > 1 && (
        <div className="mb-4 flex gap-1.5">
          {feed.rankings.map((x, i) => (
            <button key={x.title} onClick={() => { setTab(i); setMore(false); }}
              className={cn("label-mono relative rounded-full px-3 py-1.5 transition-colors", tab === i ? "text-background" : "text-muted-foreground hover:text-foreground")}>
              {tab === i && <motion.span layoutId={`rank-tab-${feed.sport}`} className="absolute inset-0 -z-10 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">{x.title}</span>
            </button>
          ))}
        </div>
      )}
      {!r || r.rows.length === 0 ? <Empty text={L("Ranking no disponible por ahora.", "Ranking unavailable right now.")} /> : (
        <>
          {feed.rankings.length === 1 && <p className="label-mono mb-2 text-muted-foreground">{r.title}</p>}
          <table className="w-full text-sm">
            <tbody>
              {r.rows.slice(0, more ? 20 : 10).map((row) => (
                <tr key={`${row.rank}-${row.name}`} className="border-t border-rock/40">
                  <td className="label-mono w-10 py-3 text-muted-foreground">{String(row.rank).padStart(2, "0")}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      {row.country && <Flag of={row.country} />}
                      <span className="font-medium">{row.name}</span>
                      {row.team && <span className="text-muted-foreground">{row.team}</span>}
                      {row.move ? (
                        <span className={cn("label-mono inline-flex items-center", row.move > 0 ? "text-signal" : "text-muted-foreground")}>
                          {row.move > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{Math.abs(row.move)}
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="w-24 py-3 text-right font-display text-lg tabular-nums">{row.points?.toLocaleString(locale) ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.rows.length > 10 && (
            <button onClick={() => setMore((v) => !v)} className="label-mono mt-4 text-muted-foreground transition-colors hover:text-foreground">
              {more ? L("Ver top 10", "Show top 10") : L(`Ver top ${Math.min(20, r.rows.length)}`, `Show top ${Math.min(20, r.rows.length)}`)}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-rock/60 p-6 text-sm text-muted-foreground">{text}</p>;
}
