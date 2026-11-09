import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHead, Counter, Rule } from "@/components/mission/primitives";
import { Flag } from "@/components/sports/Flag";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ageOn, countryEs, fmtDate, fmtDateTime, nationalityEs, raceLabel, useF1Season, type F1Race, type F1Season as Season } from "@/lib/f1";
import ChampionScene from "./ChampionScene";
import ChampionComic from "./ChampionComic";
import { CHAMPION_ART } from "@/components/sports/media";
import type { LiveFact } from "@/components/sports/HistoryPanel";
import type { Recap } from "@/components/sports/NewsPanel";
import { PlayCircle, ArrowUpRight } from "lucide-react";
import { teamColor } from "./teams";
import { tr, useLang } from "@/lib/lang";

/* Récords históricos usados en los datos curiosos (fijos: no cambian con la temporada) */
const VETTEL_RECORD = { years: 23, days: 134 }; // campeón más joven, 2010
const LAST_ITALIAN = { name: "Alberto Ascari", year: 1953 };

export default function F1Season({ onGoNews }: { onGoNews?: () => void }) {
  const { data, isLoading, isError } = useF1Season();
  const { L } = useLang();

  if (isLoading) return <F1Skeleton />;
  if (isError || !data || data.drivers.length === 0) {
    return (
      <div className="border border-dashed border-rock/60 p-10 text-center">
        <p className="label-mono text-muted-foreground">{L("Telemetría F1 sin señal", "F1 telemetry offline")}</p>
        <p className="mt-3 text-sm text-muted-foreground">{L("No se pudo conectar con la API de resultados. Inténtalo en unos minutos.", "Couldn't reach the results API. Try again in a few minutes.")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-20 sm:space-y-28">
      <ChampionBlock data={data} />
      <TitleFight data={data} />
      <div className="grid gap-12 lg:grid-cols-2">
        <NextRace race={data.nextRace} />
        <LastRace data={data} />
      </div>
      <SeasonStrip data={data} />
      <Standings data={data} />
      <RecapStrip data={data} onGoNews={onGoNews} />
    </div>
  );
}

/* ───────────────────────── Campeón / líder ───────────────────────── */
function ChampionBlock({ data }: { data: Season }) {
  const leader = data.drivers[0];
  const decided = data.title.decided;
  const remaining = data.totalRounds - data.round;
  const age = ageOn(leader.dateOfBirth);
  const { L } = useLang();

  const stats = [
    { label: L("Puntos", "Points"), value: leader.points },
    { label: L("Victorias", "Wins"), value: leader.wins },
    { label: decided ? L("Ventaja final*", "Final lead*") : L("Ventaja", "Lead"), value: data.title.lead, prefix: "+" },
    { label: L("Edad", "Age"), value: age.years, unit: L("años", "yrs") },
  ];

  // Con fotos del campeón: página de cómic a todo el ancho; si no, la ilustración SVG genérica
  const art = decided ? CHAMPION_ART[leader.id] : undefined;

  return (
    <div className={cn("grid items-center gap-10 lg:grid-cols-12", art && "items-start")}>
      {art && (
        <div className="lg:col-span-12">
          <ChampionComic driver={leader} season={data.season} lead={data.title.lead} remaining={remaining} art={art} />
        </div>
      )}
      <div className={cn("lg:col-span-7", art && "hidden")}>
        <div className="relative border border-rock/50 bg-card/60 p-4 sm:p-6">
          <span className="label-mono absolute left-4 top-4 flex items-center gap-2 text-muted-foreground sm:left-6 sm:top-6">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            {decided ? L(`Campeón del mundo ${data.season}`, `${data.season} World Champion`) : L(`Líder · ronda ${data.round}`, `Leader · round ${data.round}`)}
          </span>
          <div className="pt-8">
            {!art && <ChampionScene number={leader.number} teamId={leader.teamId} nationality={leader.nationality} mode={decided ? "champion" : "leader"} />}
          </div>
        </div>
      </div>

      <div className={art ? "lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-10" : "lg:col-span-5"}>
        <div className={art ? "lg:col-span-6" : undefined}>
        <p className="label-mono flex items-center gap-2 text-muted-foreground">
          <Flag of={leader.nationality} /> {nationalityEs(leader.nationality)} · #{leader.number} · {leader.team}
        </p>
        <h3 className="font-display mt-5 text-[clamp(2.6rem,6vw,4.6rem)]">
          <motion.span className="block" initial={{ y: "60%", opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: easeOutExpo }}>
            {leader.firstName}
          </motion.span>
          <motion.span className="block" initial={{ y: "60%", opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.08 }}>
            {leader.lastName}
            {decided && <span className="ml-3 align-top text-[0.4em] text-signal">★</span>}
          </motion.span>
        </h3>

        <p className="mt-6 max-w-[46ch] text-muted-foreground">
          {decided ? (
            <>
              {L("Título asegurado matemáticamente a falta de", "Title mathematically secured with")} <strong className="text-foreground">{remaining} {remaining === 1 ? L("carrera", "race") : L("carreras", "races")}</strong>{L(":", " to go:")}
              {" "}{L(`${data.title.lead} puntos de ventaja con solo ${data.title.maxRemaining} todavía en juego.`, `a ${data.title.lead}-point lead with only ${data.title.maxRemaining} still up for grabs.`)}
            </>
          ) : (
            <>
              {L("Lidera con", "Leads by")} <strong className="text-foreground">{data.title.lead} {L("puntos", "points")}</strong>{L(` de ventaja y quedan ${data.title.maxRemaining} en juego en ${remaining} ${remaining === 1 ? "carrera" : "carreras"}.`, ` with ${data.title.maxRemaining} still up for grabs over ${remaining} ${remaining === 1 ? "race" : "races"}.`)}
            </>
          )}
        </p>
        </div>

        <div className={art ? "lg:col-span-6 lg:self-end" : undefined}>
        <dl className={cn("mt-8 grid grid-cols-2 gap-x-8", art && "sm:grid-cols-4")}>
          {stats.map((s, i) => (
            <div key={s.label} className="pb-5">
              <Rule delay={0.1 + i * 0.06} />
              <dt className="label-mono pt-3 text-muted-foreground">{s.label}</dt>
              <dd className="font-display mt-2 text-4xl">
                {s.prefix}<Counter value={s.value} />
                {s.unit && <span className="label-mono ml-2 align-top text-muted-foreground">{s.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
        {decided && <p className="label-mono text-muted-foreground/70">{L(`* ventaja actual, ronda ${data.round}`, `* current lead, round ${data.round}`)}</p>}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Lucha por el título ───────────────────────── */
function TitleFight({ data }: { data: Season }) {
  const top = data.drivers.slice(0, 6);
  const max = top[0].points || 1;
  const { L } = useLang();
  return (
    <div>
      <SectionHead index="F1.1" title={L("Lucha por el título", "Title fight")} aside={`${data.title.maxRemaining} ${L("pts en juego", "pts available")}`} className="mb-8" />
      <ol className="space-y-4">
        {top.map((d, i) => (
          <li key={d.id} className="grid grid-cols-[2.2rem_minmax(0,9rem)_1fr_4rem] items-center gap-3 sm:grid-cols-[2.5rem_12rem_1fr_5rem] sm:gap-5">
            <span className="label-mono text-muted-foreground">{String(d.position).padStart(2, "0")}</span>
            <span className="truncate text-sm font-medium sm:text-base">
              <Flag of={d.nationality} className="mr-2" />{d.code} <span className="hidden text-muted-foreground sm:inline">· {d.lastName}</span>
            </span>
            <div className="relative h-7 overflow-hidden bg-muted">
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ backgroundColor: teamColor(d.teamId) }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(d.points / max) * 100}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.2, ease: easeOutExpo, delay: i * 0.08 }}
              />
              {/* línea del máximo que aún puede alcanzar */}
              {i > 0 && (
                <div
                  className="absolute inset-y-0 border-r-2 border-dashed border-foreground/40"
                  style={{ left: `${Math.min(100, ((d.points + data.title.maxRemaining) / max) * 100)}%` }}
                  title={L("Máximo alcanzable", "Maximum reachable")}
                />
              )}
            </div>
            <span className="text-right font-display text-xl tabular-nums sm:text-2xl">{d.points}</span>
          </li>
        ))}
      </ol>
      <p className="label-mono mt-5 text-muted-foreground">
        <span className="mr-2 inline-block h-3 border-r-2 border-dashed border-foreground/40 align-middle" />
        {L("máximo alcanzable sumando todo lo que queda", "maximum reachable if they win everything left")}
      </p>
    </div>
  );
}

/* ───────────────────────── Próxima carrera (cuenta atrás) ───────────────────────── */
function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

function NextRace({ race }: { race: F1Race | null }) {
  const left = useCountdown(race?.time ?? race?.date ?? null);
  const { L } = useLang();
  return (
    <div>
      <SectionHead index="F1.2" title={L("Próxima carrera", "Next race")} aside={race ? `${L("Ronda", "Round")} ${race.round}` : undefined} className="mb-8" />
      {!race ? (
        <p className="text-muted-foreground">{L("Temporada terminada. Nos vemos en la próxima.", "Season over. See you next year.")}</p>
      ) : (
        <>
          <p className="label-mono flex items-center gap-2 text-muted-foreground"><Flag of={race.country} /> {countryEs(race.country)}{race.sprint && <span className="text-signal">· Sprint</span>}</p>
          <h4 className="font-display mt-3 text-4xl sm:text-5xl">{raceLabel(race)}</h4>
          <p className="mt-2 text-sm text-muted-foreground">{race.circuit}</p>
          {left && (
            <div className="mt-8 grid grid-cols-4 gap-3">
              {([[L("días", "days"), left.d], [L("horas", "hours"), left.h], ["min", left.m], [L("seg", "sec"), left.s]] as const).map(([label, v]) => (
                <div key={label} className="border-t border-rock/60 pt-3">
                  <p className="font-display text-4xl tabular-nums sm:text-5xl">{String(v).padStart(2, "0")}</p>
                  <p className="label-mono mt-1 text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )}
          <dl className="label-mono mt-8 space-y-2 text-muted-foreground">
            {race.qualifying && <div className="flex justify-between gap-4"><dt>{L("Clasificación", "Qualifying")}</dt><dd className="text-foreground">{fmtDateTime(race.qualifying)}</dd></div>}
            {race.time && <div className="flex justify-between gap-4"><dt>{L("Carrera", "Race")}</dt><dd className="text-foreground">{fmtDateTime(race.time)}</dd></div>}
          </dl>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Última carrera (podio cartoon) ───────────────────────── */
function LastRace({ data }: { data: Season }) {
  const race = data.lastRace;
  const reduce = useReducedMotion();
  const { L } = useLang();
  if (!race) return null;
  // Orden visual clásico 2 · 1 · 3
  const order = [race.podium[1], race.podium[0], race.podium[2]].filter(Boolean);
  const heights: Record<number, number> = { 1: 120, 2: 84, 3: 60 };
  const driverOf = (id: string) => data.drivers.find((d) => d.id === id);

  return (
    <div>
      <SectionHead index="F1.3" title={L("Última carrera", "Last race")} aside={`${L("Ronda", "Round")} ${race.round}`} className="mb-8" />
      <p className="label-mono flex items-center gap-2 text-muted-foreground"><Flag of={race.country} /> {countryEs(race.country)} · {fmtDate(race.date, { day: "2-digit", month: "long" })}</p>
      <h4 className="font-display mt-3 text-4xl sm:text-5xl">{raceLabel(race)}</h4>

      <div className="mt-8 grid grid-cols-3 items-end gap-3">
        {order.map((p, i) => {
          const d = driverOf(p.driverId);
          return (
            <div key={p.driverId} className="flex flex-col items-center">
              <motion.div
                initial={reduce ? false : { y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.6, ease: easeOutExpo }}
                className="mb-3 text-center"
              >
                <p className="font-display text-2xl">{p.code}</p>
                <p className="label-mono mt-1 flex items-center justify-center gap-1.5 text-muted-foreground"><Flag of={d?.nationality} /> {p.team}</p>
              </motion.div>
              <motion.div
                className="flex w-full items-start justify-center border-2 border-foreground pt-2"
                style={{ backgroundColor: p.position === 1 ? "hsl(var(--foreground))" : "hsl(var(--muted))" }}
                initial={reduce ? false : { height: 0 }}
                whileInView={{ height: heights[p.position] }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: easeOutExpo, delay: i * 0.12 }}
              >
                <span className={cn("font-display text-3xl", p.position === 1 ? "text-background" : "text-foreground")}>{p.position}</span>
              </motion.div>
              <div className="h-1 w-full" style={{ backgroundColor: teamColor(d?.teamId) }} />
            </div>
          );
        })}
      </div>
      {race.podium[0]?.time && <p className="label-mono mt-4 text-muted-foreground">{L("Tiempo del ganador", "Winner's time")} · <span className="text-foreground">{race.podium[0].time}</span></p>}
    </div>
  );
}

/* ───────────────────────── Calendario de la temporada ───────────────────────── */
function SeasonStrip({ data }: { data: Season }) {
  const { L } = useLang();
  return (
    <div>
      <SectionHead index="F1.4" title={`${L("Calendario", "Calendar")} ${data.season}`} aside={`${data.round}/${data.totalRounds} ${L("completadas", "completed")}`} className="mb-8" />
      <ol className="grid grid-cols-4 gap-px bg-rock/40 sm:grid-cols-6 lg:grid-cols-8">
        {data.races.map((r) => {
          const done = r.round <= data.round;
          const next = r.round === data.nextRace?.round;
          return (
            <li key={r.round} className={cn("relative bg-background p-3", done && "bg-muted/60")}>
              <div className="label-mono flex items-center justify-between text-muted-foreground">
                <span className={cn(next && "text-signal")}>R{String(r.round).padStart(2, "0")}</span>
                {r.sprint && <span title={L("Fin de semana con sprint", "Sprint weekend")}>S</span>}
              </div>
              <p className={cn("mt-2 truncate text-sm font-medium", done && "text-muted-foreground line-through decoration-rock")}>
                <Flag of={r.country} className="mr-1.5" />{r.locality}
              </p>
              <p className="label-mono mt-1 text-muted-foreground">{fmtDate(r.date)}</p>
              {next && <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-signal" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ───────────────────────── Clasificaciones ───────────────────────── */
function Standings({ data }: { data: Season }) {
  const [showAll, setShowAll] = useState(false);
  const drivers = showAll ? data.drivers : data.drivers.slice(0, 10);
  const { L } = useLang();
  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <SectionHead index="F1.5" title={L("Pilotos", "Drivers")} aside={`${data.drivers.length} ${L("pilotos", "drivers")}`} className="mb-6" />
        <table className="w-full text-sm">
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-rock/40 transition-colors hover:bg-muted/50">
                <td className="label-mono w-10 py-3 text-muted-foreground">{String(d.position).padStart(2, "0")}</td>
                <td className="py-3">
                  <span className="mr-2 inline-block h-3 w-1 align-middle" style={{ backgroundColor: teamColor(d.teamId) }} />
                  <Flag of={d.nationality} className="mr-2" />
                  <span className="font-medium">{d.firstName} {d.lastName}</span>
                  <span className="ml-2 hidden text-muted-foreground sm:inline">{d.team}</span>
                </td>
                <td className="label-mono hidden w-16 py-3 text-right text-muted-foreground sm:table-cell">{d.wins > 0 ? `${d.wins} ${L("V", "W")}` : ""}</td>
                <td className="w-16 py-3 text-right font-display text-lg tabular-nums">{d.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.drivers.length > 10 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="label-mono mt-4 text-muted-foreground transition-colors hover:text-signal">
            {showAll ? L("− Ver top 10", "− Show top 10") : L(`+ Ver los ${data.drivers.length}`, `+ Show all ${data.drivers.length}`)}
          </button>
        )}
      </div>

      <div className="lg:col-span-5">
        <SectionHead index="F1.6" title={L("Constructores", "Constructors")} className="mb-6" />
        <ul>
          {data.constructors.map((c, i) => {
            const max = data.constructors[0].points || 1;
            return (
              <li key={c.id} className="border-t border-rock/40 py-3">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span><span className="label-mono mr-3 text-muted-foreground">{String(c.position).padStart(2, "0")}</span><span className="font-medium">{c.name}</span></span>
                  <span className="font-display text-lg tabular-nums">{c.points}</span>
                </div>
                <div className="mt-2 h-1 bg-muted">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: teamColor(c.id) }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(c.points / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: easeOutExpo, delay: i * 0.05 }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── Datos de la temporada para Historia ───────────────────────── */
/** Hitos que la temporada actual está escribiendo (se muestran al inicio del subapartado Historia). */
export function f1LiveFacts(data: Season): LiveFact[] {
  const leader = data.drivers[0];
  if (!leader || !data.title.decided) return [];
  const age = ageOn(leader.dateOfBirth);
  const youngerThanVettel = age.years < VETTEL_RECORD.years || (age.years === VETTEL_RECORD.years && age.days < VETTEL_RECORD.days);
  return [
    ...(youngerThanVettel ? [{
      k: tr(`${age.years} años`, `${age.years} yrs`),
      title: tr("El campeón más joven de la historia", "The youngest champion in history"),
      body: tr(
        `${leader.firstName} ${leader.lastName} gana el título más joven que Sebastian Vettel, que tenía el récord desde 2010 (${VETTEL_RECORD.years} años y ${VETTEL_RECORD.days} días).`,
        `${leader.firstName} ${leader.lastName} wins the title younger than Sebastian Vettel, record holder since 2010 (${VETTEL_RECORD.years} years and ${VETTEL_RECORD.days} days).`,
      ),
    }] : []),
    ...(leader.nationality === "Italian" ? [{
      k: tr(`${Number(data.season) - LAST_ITALIAN.year} años`, `${Number(data.season) - LAST_ITALIAN.year} yrs`),
      title: tr(`El primer italiano desde ${LAST_ITALIAN.name}`, `The first Italian since ${LAST_ITALIAN.name}`),
      body: tr(
        `Italia no tenía campeón de pilotos desde ${LAST_ITALIAN.name} con Ferrari en ${LAST_ITALIAN.year}. Y el primer campeón de la historia, en 1950, también fue italiano: Nino Farina.`,
        `Italy hadn't had a drivers' champion since ${LAST_ITALIAN.name} with Ferrari in ${LAST_ITALIAN.year}. And the very first champion, in 1950, was Italian too: Nino Farina.`,
      ),
    }] : []),
    {
      k: "2026",
      title: tr("Campeón en la nueva era técnica", "Champion of the new technical era"),
      body: tr(
        "El primer título del reglamento 2026: motores cuya potencia es casi mitad eléctrica, combustible 100 % sostenible y alerones móviles.",
        "The first title under the 2026 rules: power units that are almost half electric, 100% sustainable fuel and active aero.",
      ),
    },
  ];
}

/** Enlaces a los resúmenes oficiales (canal de F1 en YouTube): última carrera y campeón. */
export function f1Recaps(data: Season): Recap[] {
  const yt = (q: string) => `https://www.youtube.com/@Formula1/search?query=${encodeURIComponent(q)}`;
  const out: Recap[] = [];
  if (data.lastRace) {
    out.push({
      label: `${tr("Resumen", "Highlights")} · ${raceLabel(data.lastRace)}`,
      detail: tr(`Ronda ${data.lastRace.round} · canal oficial de F1`, `Round ${data.lastRace.round} · official F1 channel`),
      url: yt(`${data.season} ${data.lastRace.name} highlights`),
    });
  }
  if (data.title.decided) {
    const champ = data.drivers[0];
    out.push({
      label: tr(`${champ.lastName}, campeón ${data.season}`, `${champ.lastName}, ${data.season} champion`),
      detail: tr("Videos del campeón · canal oficial de F1", "Champion videos · official F1 channel"),
      url: yt(`${champ.firstName} ${champ.lastName} ${data.season}`),
    });
  }
  return out;
}

function RecapStrip({ data, onGoNews }: { data: Season; onGoNews?: () => void }) {
  const [recap] = f1Recaps(data);
  const { L } = useLang();
  if (!recap) return null;
  return (
    <div className="flex flex-col gap-4 border-y border-rock/50 py-6 sm:flex-row sm:items-center sm:justify-between">
      <a href={recap.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
        <PlayCircle className="h-10 w-10 shrink-0 transition-colors group-hover:text-signal" strokeWidth={1.4} />
        <span>
          <span className="font-display block text-2xl transition-colors group-hover:text-signal">{recap.label}</span>
          <span className="label-mono text-muted-foreground">{recap.detail}</span>
        </span>
      </a>
      {onGoNews && (
        <button type="button" onClick={onGoNews} className="label-mono inline-flex items-center gap-1.5 self-start rounded-full border border-rock/60 px-4 py-2 transition-colors hover:border-signal hover:text-signal sm:self-auto">
          {L("Noticias y sitios oficiales", "News and official sites")} <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function F1Skeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="aspect-[5/2] animate-pulse bg-muted lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="h-4 w-1/2 animate-pulse bg-muted" />
        <div className="h-20 w-3/4 animate-pulse bg-muted" />
        <div className="h-32 animate-pulse bg-muted" />
      </div>
    </div>
  );
}
