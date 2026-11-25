import { Router } from 'express';
import { catchAsyncErrors } from './asyncErrors';
import type { F1Driver, F1Constructor, F1Race, F1Season } from '@shared/f1';

/**
 * Temporada de F1 en vivo desde Jolpica (sucesora gratuita de la API Ergast, sin API key).
 * Se cachea en memoria: la API pide no superar ~4 req/s y los datos solo cambian tras cada sesión.
 * Cada pieza (pilotos, constructores, calendario, última carrera) guarda su última copia buena: si una
 * falla, las demás se actualizan igual.
 *
 * El User-Agent es necesario: Cloudflare responde 403 al de Node por defecto ("node") en todo lo que no
 * tenga ya en su caché. Eso dejaba la temporada congelada (Las Vegas 2026).
 */
const BASE = 'https://api.jolpi.ca/ergast/f1/current';
const TTL_MS = 10 * 60 * 1000;
const RETRY_MS = 60 * 1000; // con alguna pieza caducada, se reintenta antes
const RACE_MS = 3 * 60 * 60 * 1000; // pasado esto desde la salida, la carrera ya no es "la próxima"
const HEADERS = { Accept: 'application/json', 'User-Agent': 'f1-season-page/1.0' };

// Puntos máximos que un piloto puede sumar en lo que queda (sin vuelta rápida desde 2025)
const MAX_RACE_POINTS = 25;
const MAX_SPRINT_POINTS = 8;

async function fetchJson(path: string): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, { headers: HEADERS, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`Jolpica ${path} → ${res.status}`);
      return (await res.json()).MRData;
    } catch (err) {
      if (attempt >= 1) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

/** Última respuesta buena de cada ruta */
const good = new Map<string, { data: any; at: number }>();

/** `staleAt`: cuándo se obtuvo la copia antigua que se sirve; null si el dato es fresco */
async function getJson(path: string, required = true): Promise<{ data: any; staleAt: number | null; missing: boolean }> {
  try {
    const data = await fetchJson(path);
    good.set(path, { data, at: Date.now() });
    return { data, staleAt: null, missing: false };
  } catch (err) {
    const old = good.get(path);
    if (!old && required) throw err;
    console.warn('[f1]', (err as Error).message, old ? '→ copia anterior' : '→ sin datos');
    return { data: old?.data ?? null, staleAt: old?.at ?? null, missing: !old };
  }
}

const isoDateTime = (date?: string, time?: string) => (date ? `${date}T${time ?? '00:00:00Z'}` : null);

function toRace(r: any): F1Race {
  return {
    round: Number(r.round),
    name: r.raceName,
    circuit: r.Circuit.circuitName,
    locality: r.Circuit.Location.locality,
    country: r.Circuit.Location.country,
    date: r.date,
    time: isoDateTime(r.date, r.time),
    sprint: Boolean(r.Sprint),
    qualifying: isoDateTime(r.Qualifying?.date, r.Qualifying?.time),
  };
}

async function loadSeason(): Promise<F1Season> {
  const parts = await Promise.all([
    getJson('/driverStandings.json'),
    getJson('/constructorStandings.json', false),
    getJson('.json?limit=40'),
    getJson('/last/results.json', false),
  ]);
  const [driversData, constructorsData, racesData, lastData] = parts.map((p) => p.data);
  const staleAts = parts.flatMap((p) => (p.staleAt ? [p.staleAt] : []));

  const standings = driversData.StandingsTable.StandingsLists[0];
  // La ronda completada sale de los últimos RESULTADOS, no de la clasificación: Jolpica a veces
  // adelanta la ronda de la clasificación antes de correrse la carrera (pasó con Las Vegas 2026).
  const lastRound = Number(lastData?.RaceTable.Races[0]?.round ?? 0);
  const round = lastRound || Number(standings?.round ?? 0);
  const drivers: F1Driver[] = (standings?.DriverStandings ?? []).map((d: any) => ({
    position: Number(d.position), points: Number(d.points), wins: Number(d.wins),
    id: d.Driver.driverId, code: d.Driver.code, number: d.Driver.permanentNumber,
    firstName: d.Driver.givenName, lastName: d.Driver.familyName,
    nationality: d.Driver.nationality, dateOfBirth: d.Driver.dateOfBirth,
    team: d.Constructors.at(-1)?.name ?? '', teamId: d.Constructors.at(-1)?.constructorId ?? '',
  }));
  const constructors: F1Constructor[] = (constructorsData?.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []).map((c: any) => ({
    position: Number(c.position), points: Number(c.points), wins: Number(c.wins),
    id: c.Constructor.constructorId, name: c.Constructor.name, nationality: c.Constructor.nationality,
  }));
  const races: F1Race[] = racesData.RaceTable.Races.map(toRace);

  const last = lastData?.RaceTable.Races[0];
  const lastRace = last
    ? {
        ...toRace(last),
        podium: last.Results.slice(0, 3).map((r: any) => ({
          position: Number(r.position), driverId: r.Driver.driverId, code: r.Driver.code,
          name: `${r.Driver.givenName} ${r.Driver.familyName}`, team: r.Constructor.name,
          time: r.Time?.time ?? r.status ?? null,
        })),
      }
    : null;

  // ¿Título decidido? Ventaja del líder > puntos que aún quedan en juego.
  const remaining = races.filter((r) => r.round > round);
  const maxRemaining = remaining.reduce((sum, r) => sum + MAX_RACE_POINTS + (r.sprint ? MAX_SPRINT_POINTS : 0), 0);
  const [leader, second] = drivers;
  const lead = leader && second ? leader.points - second.points : 0;

  return {
    season: racesData.RaceTable.season,
    round,
    totalRounds: races.length,
    drivers,
    constructors,
    races,
    lastRace,
    // Una carrera ya corrida cuyos resultados aún no publica la API no es "la próxima"
    nextRace: remaining.find((r) => +new Date(r.time ?? `${r.date}T23:59:59Z`) + RACE_MS > Date.now()) ?? null,
    title: { decided: Boolean(leader) && lead > maxRemaining, leaderId: leader?.id ?? null, lead, maxRemaining },
    updatedAt: new Date(staleAts.length ? Math.min(...staleAts) : Date.now()).toISOString(),
    stale: parts.some((p) => p.staleAt !== null || p.missing),
  };
}

let cache: { data: F1Season; at: number } | null = null;
let inflight: Promise<F1Season> | null = null;

async function getSeason(): Promise<F1Season> {
  if (cache && Date.now() - cache.at < (cache.data.stale ? RETRY_MS : TTL_MS)) return cache.data;
  inflight ??= loadSeason()
    .then((data) => { cache = { data, at: Date.now() }; return data; })
    .finally(() => { inflight = null; });
  try {
    return await inflight;
  } catch (err) {
    if (cache) { console.warn('[f1] Jolpica falló, sirviendo caché antigua:', err); return { ...cache.data, stale: true }; }
    throw err;
  }
}

const router = Router();
catchAsyncErrors(router);

router.get('/season', async (_req, res) => {
  try {
    const data = await getSeason();
    res.set('Cache-Control', data.stale ? 'no-store' : 'public, max-age=60');
    res.json(data);
  } catch (err) {
    console.error('[f1] Error cargando temporada:', err);
    res.status(502).json({ message: 'No se pudo cargar la temporada de F1' });
  }
});

export default router;
