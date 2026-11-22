import type { SeasonEvent, SeasonFeed, SeasonMatch, SeasonRanking } from '@shared/season';

/**
 * Tenis en vivo desde el API público de ESPN (sin clave; no es un API oficial documentado, así que
 * todo va con caché y, si falla, se sirve la última copia buena). Tres piezas con distinto ritmo:
 *  - torneos en curso y partidos: cambian minuto a minuto → 60 s si hay partidos en juego, 10 min si no
 *  - ranking ATP/WTA: se publica los lunes → 6 h
 *  - calendario de los próximos 12 meses: casi fijo → 12 h
 */
const BASE = 'https://site.api.espn.com/apis/site/v2/sports/tennis';
const TOURS = ['atp', 'wta'] as const;
type Tour = (typeof TOURS)[number];

async function getJson(path: string, timeoutMs = 15_000): Promise<any> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`ESPN ${path} → ${res.status}`);
  return res.json();
}

/** Caché con TTL variable, una sola petición en vuelo y copia antigua si la fuente falla */
function cached<T>(name: string, load: () => Promise<T>, ttl: (data: T) => number) {
  let entry: { data: T; at: number } | null = null;
  let inflight: Promise<T> | null = null;
  return async (): Promise<T> => {
    if (entry && Date.now() - entry.at < ttl(entry.data)) return entry.data;
    inflight ??= load().then((data) => { entry = { data, at: Date.now() }; return data; }).finally(() => { inflight = null; });
    try { return await inflight; } catch (err) {
      if (entry) { console.warn(`[tennis] ${name} falló, sirviendo caché antigua:`, err); return entry.data; }
      throw err;
    }
  };
}

// Sede de los torneos grandes (ESPN no siempre trae la sede de los futuros)
const VENUES: Record<string, [string, string]> = {
  'australian open': ['Melbourne', 'Australia'], 'roland garros': ['París', 'France'], 'french open': ['París', 'France'],
  wimbledon: ['Londres', 'United Kingdom'], 'us open': ['Nueva York', 'USA'], 'atp finals': ['Turín', 'Italy'],
  'indian wells': ['Indian Wells', 'USA'],
  'bnp paribas open': ['Indian Wells', 'USA'], 'miami open': ['Miami', 'USA'], 'monte-carlo': ['Montecarlo', 'Monaco'],
  'mutua madrid open': ['Madrid', 'Spain'], 'internazionali bnl': ['Roma', 'Italy'], 'italian open': ['Roma', 'Italy'],
  'national bank open': ['Canadá', 'Canada'], 'cincinnati open': ['Cincinnati', 'USA'], 'shanghai': ['Shanghái', 'China'],
  'rolex paris masters': ['París', 'France'], 'brisbane international': ['Brisbane', 'Australia'], 'adelaide international': ['Adelaida', 'Australia'],
  'asb classic': ['Auckland', 'New Zealand'], 'abierto mexicano': ['Acapulco', 'Mexico'], 'mexican open': ['Acapulco', 'Mexico'],
  'china open': ['Pekín', 'China'], 'qatar': ['Doha', 'Qatar'], 'dubai': ['Dubái', 'UAE'], 'davis cup': ['', ''], 'united cup': ['Australia', 'Australia'],
};
const venueOf = (name: string, espnVenue?: string): [string | null, string | null] => {
  // Primero la sede que da ESPN; si no, la coincidencia más larga ("wta finals indian wells" → Indian Wells)
  if (espnVenue) { const parts = espnVenue.split(',').map((s) => s.trim()); return [parts.slice(1, -1).join(', ') || parts[0], parts.at(-1) ?? null]; }
  const n = name.toLowerCase();
  if (/next gen/.test(n)) return [null, null];
  const hit = Object.entries(VENUES).filter(([k]) => n.includes(k)).sort((a, b) => b[0].length - a[0].length)[0];
  return hit && hit[1][0] ? [hit[1][0], hit[1][1]] : [null, null];
};
const isMajor = (e: any) => !!e.major || (/australian open|roland garros|french open|wimbledon|us open|atp finals|wta finals/i.test(e.name ?? '') && !/next gen/i.test(e.name ?? ''));

const DRAW_ES: Record<string, string> = {
  "Men's Singles": 'Individual masculino', "Women's Singles": 'Individual femenino',
  "Men's Doubles": 'Dobles masculino', "Women's Doubles": 'Dobles femenino', 'Mixed Doubles': 'Dobles mixto',
};
const ROUND_ES: Record<string, string> = {
  Final: 'Final', Semifinal: 'Semifinal', Quarterfinal: 'Cuartos de final', 'Round Robin': 'Fase de grupos',
  'Round of 16': 'Octavos de final', 'Round of 32': 'Dieciseisavos', 'Round 1': '1.ª ronda', 'Round 2': '2.ª ronda',
  'Round 3': '3.ª ronda', 'Round 4': '4.ª ronda', 'Group Stage': 'Fase de grupos',
};

const statusByDate = (start: string, end: string): SeasonEvent['status'] => {
  const now = Date.now();
  return now < +new Date(start) ? 'pre' : now > +new Date(end) ? 'post' : 'in';
};

function toEvent(e: any, tour: Tour): SeasonEvent {
  const [location, country] = venueOf(e.name, e.venue?.displayName);
  return {
    id: `${tour}-${e.id}`, name: e.name, start: e.date, end: e.endDate ?? e.date, location, country,
    // El estado del evento de ESPN no es fiable (marca "final" con la final por jugar): se decide por fechas
    major: isMajor(e), tour: tour.toUpperCase(), status: statusByDate(e.date, e.endDate ?? e.date),
  };
}

function toMatches(e: any): SeasonMatch[] {
  const out: SeasonMatch[] = [];
  for (const g of e.groupings ?? []) {
    const draw = g.grouping?.displayName ?? '';
    if (!/Singles/.test(draw)) continue; // la vista se centra en individuales
    for (const c of g.competitions ?? []) {
      out.push({
        id: String(c.id), draw: DRAW_ES[draw] ?? draw, round: ROUND_ES[c.round?.displayName] ?? c.round?.displayName ?? '',
        date: c.date, state: c.status?.type?.state ?? 'pre', detail: c.status?.type?.shortDetail ?? '',
        players: (c.competitors ?? []).map((p: any) => ({
          name: p.athlete?.displayName ?? p.roster?.shortDisplayName ?? '—',
          country: p.athlete?.flag?.alt ?? null,
          sets: (p.linescores ?? []).map((l: any) => (typeof l.value === 'number' ? l.value : null)),
          tiebreaks: (p.linescores ?? []).map((l: any) => (typeof l.tiebreak === 'number' ? l.tiebreak : null)),
          winner: !!p.winner, seed: p.curatedRank?.current ?? null,
        })),
      });
    }
  }
  // En juego primero, luego los más recientes; la ronda más avanzada manda
  const rank = (m: SeasonMatch) => (m.state === 'in' ? 0 : m.state === 'pre' ? 1 : 2);
  return out.sort((a, b) => rank(a) - rank(b) || +new Date(b.date) - +new Date(a.date));
}

const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

const getNow = cached('scoreboard', async () => {
  const boards = await Promise.all(TOURS.map(async (t) => ({ t, j: await getJson(`/${t}/scoreboard`) })));
  const events: { event: SeasonEvent; matches: SeasonMatch[] }[] = boards.flatMap(({ t, j }) => (j.events ?? []).map((e: any) => ({ event: toEvent(e, t), matches: toMatches(e) })));
  return { events, live: events.some((x) => x.matches.some((m: SeasonMatch) => m.state === 'in')) };
}, (d) => (d.live ? 60_000 : 10 * 60_000));

const getRankings = cached('rankings', async (): Promise<SeasonRanking[]> => Promise.all(TOURS.map(async (t) => {
  const r = (await getJson(`/${t}/rankings`)).rankings?.[0];
  return {
    title: t.toUpperCase(), asOf: r?.update ?? null,
    rows: (r?.ranks ?? []).slice(0, 20).map((x: any) => ({
      rank: x.current, name: x.athlete?.displayName ?? '—', country: x.athlete?.flagAltText ?? x.athlete?.flag?.alt ?? null,
      points: typeof x.points === 'number' ? x.points : null,
      move: typeof x.previous === 'number' && typeof x.current === 'number' ? x.previous - x.current : null,
    })),
  };
})), () => 6 * 3_600_000);

const getCalendar = cached('calendar', async (): Promise<SeasonEvent[]> => {
  // ESPN rechaza (400) rangos de más de un año
  const from = new Date(Date.now() - 86_400_000);
  const to = new Date(from.getTime() + 360 * 86_400_000);
  const lists = await Promise.all(TOURS.map(async (t) => ((await getJson(`/${t}/scoreboard?dates=${ymd(from)}-${ymd(to)}`, 40_000)).events ?? []).map((e: any) => toEvent(e, t))));
  // Torneos combinados (Grand Slams, Indian Wells…) aparecen en ATP y WTA: se fusionan
  const byName = new Map<string, SeasonEvent>();
  for (const e of lists.flat()) {
    const k = `${e.name.toLowerCase()}|${e.start.slice(0, 7)}`;
    const prev = byName.get(k);
    byName.set(k, prev ? { ...prev, tour: 'ATP · WTA' } : e);
  }
  return Array.from(byName.values()).sort((a, b) => a.start.localeCompare(b.start));
}, () => 12 * 3_600_000);

export async function tennisFeed(): Promise<SeasonFeed> {
  // Cada pieza falla por separado: sin ranking se siguen viendo los partidos, y al revés
  const [nowR, rankR, calR] = await Promise.allSettled([getNow(), getRankings(), getCalendar()]);
  if (nowR.status === 'rejected' && rankR.status === 'rejected' && calR.status === 'rejected') throw nowR.reason;
  const now = nowR.status === 'fulfilled' ? nowR.value : { events: [], live: false };
  const rankings = rankR.status === 'fulfilled' ? rankR.value : [];
  const calendar = calR.status === 'fulfilled' ? calR.value : now.events.map((x) => x.event);
  // Estado por fechas (el de ESPN no es fiable)
  const events = calendar.map((e) => ({ ...e, status: statusByDate(e.start, e.end) }));

  // Destacado: el torneo grande en juego; si no, el próximo Grand Slam / Finals
  const inPlay = now.events.filter((x) => x.event.status === 'in').sort((a, b) => +b.event.major - +a.event.major);
  const current = inPlay[0] ?? now.events.find((x) => x.matches.some((m) => m.state !== 'post')) ?? null;
  const nextMajor = events.find((e) => e.major && e.status === 'pre') ?? null;
  const highlight = current?.event ?? nextMajor;

  return {
    sport: 'tenis',
    source: { name: 'ESPN', url: 'https://www.espn.com/tennis/', live: true },
    updatedAt: new Date().toISOString(),
    highlight,
    matches: current ? current.matches.slice(0, 16) : [],
    events: events.filter((e) => e.status !== 'post'),
    rankings,
  };
}
