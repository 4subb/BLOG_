import { Router } from 'express';
import { catchAsyncErrors } from './asyncErrors';
import type { F1Driver, F1Constructor, F1Race, F1Season } from '@shared/f1';

/**
 * Temporada de F1 en vivo desde Jolpica (sucesora gratuita de la API Ergast, sin API key).
 * Se cachea en memoria: la API pide no superar ~4 req/s y los datos solo cambian tras cada sesión.
 * Si Jolpica falla, se sirve la última copia buena (aunque esté caducada).
 */
const BASE = 'https://api.jolpi.ca/ergast/f1/current';
const TTL_MS = 10 * 60 * 1000;

// Puntos máximos que un piloto puede sumar en lo que queda (sin vuelta rápida desde 2025)
const MAX_RACE_POINTS = 25;
const MAX_SPRINT_POINTS = 8;

async function getJson(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Jolpica ${path} → ${res.status}`);
  return (await res.json()).MRData;
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
  const [driversData, constructorsData, racesData, lastData] = await Promise.all([
    getJson('/driverStandings.json'),
    getJson('/constructorStandings.json'),
    getJson('.json?limit=40'),
    getJson('/last/results.json'),
  ]);

  const standings = driversData.StandingsTable.StandingsLists[0];
  const round = Number(standings?.round ?? 0);
  const drivers: F1Driver[] = (standings?.DriverStandings ?? []).map((d: any) => ({
    position: Number(d.position), points: Number(d.points), wins: Number(d.wins),
    id: d.Driver.driverId, code: d.Driver.code, number: d.Driver.permanentNumber,
    firstName: d.Driver.givenName, lastName: d.Driver.familyName,
    nationality: d.Driver.nationality, dateOfBirth: d.Driver.dateOfBirth,
    team: d.Constructors.at(-1)?.name ?? '', teamId: d.Constructors.at(-1)?.constructorId ?? '',
  }));
  const constructors: F1Constructor[] = (constructorsData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []).map((c: any) => ({
    position: Number(c.position), points: Number(c.points), wins: Number(c.wins),
    id: c.Constructor.constructorId, name: c.Constructor.name, nationality: c.Constructor.nationality,
  }));
  const races: F1Race[] = racesData.RaceTable.Races.map(toRace);

  const last = lastData.RaceTable.Races[0];
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
    nextRace: remaining[0] ?? null,
    title: { decided: Boolean(leader) && lead > maxRemaining, leaderId: leader?.id ?? null, lead, maxRemaining },
    updatedAt: new Date().toISOString(),
  };
}

let cache: { data: F1Season; at: number } | null = null;
let inflight: Promise<F1Season> | null = null;

async function getSeason(): Promise<F1Season> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  inflight ??= loadSeason()
    .then((data) => { cache = { data, at: Date.now() }; return data; })
    .finally(() => { inflight = null; });
  try {
    return await inflight;
  } catch (err) {
    if (cache) { console.warn('[f1] Jolpica falló, sirviendo caché antigua:', err); return cache.data; }
    throw err;
  }
}

const router = Router();
catchAsyncErrors(router);

router.get('/season', async (_req, res) => {
  try {
    const data = await getSeason();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err) {
    console.error('[f1] Error cargando temporada:', err);
    res.status(502).json({ message: 'No se pudo cargar la temporada de F1' });
  }
});

export default router;
