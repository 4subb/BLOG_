// Forma común de /api/season/:sport (tenis y ciclismo). La F1 tiene su propio formato (shared/f1.ts).
// El servidor la arma desde la fuente que haya: en vivo (ESPN para tenis) o curada + panel (ciclismo).

export type Bi = { es: string; en: string };

export type SeasonEvent = {
  id: string;
  name: string;
  start: string;            // ISO
  end: string;              // ISO
  location: string | null;
  country: string | null;   // en inglés ("Italy"), para la bandera
  /** Grand Slam, gran vuelta o monumento */
  major: boolean;
  tour?: string;            // "ATP", "WTA", "UCI WorldTour", "Women's WorldTour"…
  status: "pre" | "in" | "post";
  winner?: string | null;
};

export type SeasonMatch = {
  id: string;
  draw: string;             // "Individual masculino"…
  round: string;            // "Final", "Semifinal"…
  date: string;
  state: "pre" | "in" | "post";
  detail: string;           // "Final", "2.º set", "dom 12:00"
  players: { name: string; country: string | null; sets: (number | null)[]; tiebreaks: (number | null)[]; winner: boolean; seed?: number | null }[];
};

export type SeasonRanking = {
  title: string;            // "ATP", "WTA", "UCI · Hombres"
  asOf: string | null;      // fecha de publicación del ranking
  rows: { rank: number; name: string; country: string | null; points: number | null; team?: string | null; move?: number | null }[];
};

export type SeasonFeed = {
  sport: "tenis" | "ciclismo";
  /** De dónde salen los datos y si se actualizan solos */
  source: { name: string; url: string; live: boolean };
  updatedAt: string;
  highlight: (SeasonEvent & { note?: Bi; url?: string }) | null;
  /** Partidos del torneo en curso (solo tenis) */
  matches: SeasonMatch[];
  events: SeasonEvent[];
  rankings: SeasonRanking[];
  /** Resumen de la temporada que acaba de terminar (curado) */
  recap?: { title: Bi; lines: Bi[]; sources: { name: string; url: string }[] };
};
