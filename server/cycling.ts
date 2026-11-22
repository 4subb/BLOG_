import type { SeasonEvent, SeasonFeed, SeasonRanking } from '@shared/season';
import { storage } from './storage';

/**
 * Ciclismo: no hay un API público fiable (la UCI no expone sus datos y ProCyclingStats prohíbe la
 * recolección automática). El calendario se publica una vez al año y el ranking cambia poco fuera
 * de temporada, así que se curan aquí con su fuente y fecha de revisión. Lo que se capture desde el
 * panel de administración (eventos y ranking) se suma o sustituye a esto sin tocar código.
 *
 * Revisado: 2026-11-21. Próxima revisión: al terminar la temporada 2027 o si la UCI cambia fechas.
 */
const REVIEWED = '2026-11-21';

type Race = [name: string, start: string, end: string, location: string, country: string, major?: boolean, tour?: string];

// Calendario UCI WorldTour 2027 (aprobado por el Consejo del Ciclismo Profesional, mayo de 2026)
const RACES_2027: Race[] = [
  ['Santos Tour Down Under', '2027-01-19', '2027-01-24', 'Adelaida', 'Australia'],
  ['Cadel Evans Great Ocean Road Race', '2027-01-31', '2027-01-31', 'Geelong', 'Australia'],
  ['UAE Tour', '2027-02-15', '2027-02-21', 'Emiratos', 'UAE'],
  ['Omloop Nieuwsblad', '2027-02-27', '2027-02-27', 'Gante', 'Belgium'],
  ['Strade Bianche', '2027-03-06', '2027-03-06', 'Siena', 'Italy'],
  ['París-Niza', '2027-03-07', '2027-03-14', 'Francia', 'France'],
  ['Tirreno-Adriático', '2027-03-08', '2027-03-14', 'Italia', 'Italy'],
  ['Milán-San Remo', '2027-03-20', '2027-03-20', 'San Remo', 'Italy', true],
  ['Volta a Catalunya', '2027-03-22', '2027-03-28', 'Cataluña', 'Spain'],
  ['E3 Saxo Classic', '2027-03-26', '2027-03-26', 'Harelbeke', 'Belgium'],
  ['Gent-Wevelgem', '2027-03-28', '2027-03-28', 'Wevelgem', 'Belgium'],
  ['Tour de Flandes', '2027-04-04', '2027-04-04', 'Oudenaarde', 'Belgium', true],
  ['Itzulia Basque Country', '2027-04-05', '2027-04-10', 'País Vasco', 'Spain'],
  ['París-Roubaix', '2027-04-11', '2027-04-11', 'Roubaix', 'France', true],
  ['Amstel Gold Race', '2027-04-18', '2027-04-18', 'Valkenburg', 'Netherlands'],
  ['Flecha Valona', '2027-04-21', '2027-04-21', 'Huy', 'Belgium'],
  ['Lieja-Bastoña-Lieja', '2027-04-25', '2027-04-25', 'Lieja', 'Belgium', true],
  ['Tour de Romandía', '2027-04-27', '2027-05-02', 'Suiza', 'Switzerland'],
  ["Giro d'Italia", '2027-05-08', '2027-05-30', 'Italia', 'Italy', true],
  ['Giro Women', '2027-05-29', '2027-06-06', 'Italia', 'Italy', true, "Women's WorldTour"],
  ['Tour Auvergne-Rhône-Alpes (ex Dauphiné)', '2027-06-06', '2027-06-13', 'Francia', 'France'],
  ['Tour de Suiza', '2027-06-16', '2027-06-20', 'Suiza', 'Switzerland'],
  ['Tour de Francia', '2027-07-02', '2027-07-25', 'Francia', 'France', true],
  ['Clásica de San Sebastián', '2027-07-31', '2027-07-31', 'San Sebastián', 'Spain'],
  ['Tour de France Femmes', '2027-07-30', '2027-08-07', 'Francia', 'France', true, "Women's WorldTour"],
  ['Tour de Polonia', '2027-08-02', '2027-08-08', 'Polonia', 'Poland'],
  ['Mundiales de Ciclismo', '2027-08-24', '2027-09-05', 'Alta Saboya Mont-Blanc', 'France', true, 'UCI'],
  ['La Vuelta a España', '2027-09-04', '2027-09-26', 'España', 'Spain', true],
  ['GP de Québec', '2027-09-10', '2027-09-10', 'Quebec', 'Canada'],
  ['GP de Montréal', '2027-09-12', '2027-09-12', 'Montreal', 'Canada'],
  ['Il Lombardia', '2027-10-09', '2027-10-09', 'Lombardía', 'Italy', true],
  ['Tour of Guangxi', '2027-10-12', '2027-10-17', 'Guangxi', 'China'],
];

// Ranking UCI individual masculino, cierre de la temporada 2026
const UCI_MEN_2026: [name: string, country: string, points: number][] = [
  ['Tadej Pogačar', 'Slovenia', 9332], ['Remco Evenepoel', 'Belgium', 7192], ['Isaac del Toro', 'Mexico', 5607],
  ['Paul Seixas', 'France', 5580], ['Tom Pidcock', 'United Kingdom', 4412], ['Jonas Vingegaard', 'Denmark', 4161],
  ['Wout van Aert', 'Belgium', 3759], ['Jasper Philipsen', 'Belgium', 3666], ['Felix Gall', 'Austria', 3425],
  ['Mathieu van der Poel', 'Netherlands', 3405],
];

const RECAP: NonNullable<SeasonFeed['recap']> = {
  title: { es: 'La temporada 2026 en cuatro líneas', en: 'The 2026 season in four lines' },
  lines: [
    { es: 'Tadej Pogačar cierra como n.º 1 del ranking UCI por sexto año seguido.', en: 'Tadej Pogačar finishes as UCI world No. 1 for a sixth straight year.' },
    { es: 'Tour de Francia: Pogačar gana su quinto Tour, con Remco Evenepoel 2.º e Isaac del Toro 3.º.', en: 'Tour de France: Pogačar wins his fifth Tour, with Remco Evenepoel 2nd and Isaac del Toro 3rd.' },
    { es: 'Del Toro, en su debut, logra el primer podio mexicano en el Tour y el maillot blanco al mejor joven.', en: 'On debut, del Toro takes Mexico’s first Tour podium and the white jersey for best young rider.' },
    { es: 'Pogačar suma su cuarta Strade Bianche, récord de la carrera.', en: 'Pogačar wins a record fourth Strade Bianche.' },
  ],
  sources: [
    { name: 'Domestique · ranking UCI 2026', url: 'https://www.domestiquecycling.com/en/features/from-pogacar-to-van-der-poel-how-cyclings-biggest-stars-earned-their-uci-ranking-points-in-2026/' },
    { name: 'beIN Sports · podio de del Toro', url: 'https://www.beinsports.com/en-us/cycling/articles/historic-isaac-del-toro-secures-mexico-s-first-tour-de-france-podium-2026-07-25' },
    { name: 'Domestique · calendario 2027', url: 'https://www.domestiquecycling.com/en/2027-uci-worldtour-calendar/' },
  ],
};

const iso = (d: string, endOfDay = false) => `${d}T${endOfDay ? '22:00:00' : '08:00:00'}Z`;

export async function cyclingFeed(): Promise<SeasonFeed> {
  const now = Date.now();
  const curated: SeasonEvent[] = RACES_2027.map(([name, start, end, location, country, major, tour]) => ({
    id: `uci-${start}-${name}`, name, start: iso(start), end: iso(end, true), location, country,
    major: !!major, tour: tour ?? 'UCI WorldTour',
    status: now > +new Date(iso(end, true)) ? 'post' : now >= +new Date(iso(start)) ? 'in' : 'pre',
  }));

  // Lo capturado en el panel se añade al calendario y, si hay ranking, sustituye al curado
  const [dbEvents, dbRankings] = await Promise.all([storage.getEvents('ciclismo'), storage.getRankings('ciclismo')]);
  const manual: SeasonEvent[] = dbEvents.map((e) => {
    const start = new Date(e.eventDate).toISOString();
    return { id: e.id, name: e.eventName, start, end: start, location: e.location ?? null, country: null, major: false, status: +new Date(start) < now - 86_400_000 ? 'post' : 'pre' };
  });
  const events = [...curated, ...manual].filter((e) => e.status !== 'post').sort((a, b) => a.start.localeCompare(b.start));

  const rankings: SeasonRanking[] = dbRankings.length
    ? Object.entries(dbRankings.reduce<Record<string, typeof dbRankings>>((acc, r) => { (acc[r.rankingName] ??= []).push(r); return acc; }, {}))
        .map(([title, rows]) => ({ title, asOf: null, rows: rows.map((r) => ({ rank: r.rank, name: r.athleteName, country: null, points: r.points, team: r.teamName })) }))
    : [{ title: 'UCI · Hombres · cierre 2026', asOf: null, rows: UCI_MEN_2026.map(([name, country, points], i) => ({ rank: i + 1, name, country, points })) }];

  const next = events[0] ?? null;
  const opener = next && next.id === curated.find((e) => e.status !== 'post')?.id && next.start.startsWith('2027-01');
  return {
    sport: 'ciclismo',
    source: { name: `UCI · curado (${REVIEWED})`, url: 'https://www.uci.org/', live: false },
    updatedAt: new Date(`${REVIEWED}T12:00:00Z`).toISOString(),
    highlight: next && {
      ...next,
      note: opener
        ? { es: 'Arranca la temporada 2027 del WorldTour en Australia. Después: clásicas de primavera, Giro, Tour, Mundiales en Francia y Vuelta.', en: 'The 2027 WorldTour season starts in Australia. Then: spring classics, Giro, Tour, Worlds in France and the Vuelta.' }
        : undefined,
    },
    matches: [],
    events,
    rankings,
    recap: RECAP,
  };
}
