// Forma de /api/f1/season (server/f1.ts). Compartido entre cliente y servidor.
export type F1Driver = {
  position: number; points: number; wins: number;
  id: string; code: string; number: string; firstName: string; lastName: string;
  nationality: string; dateOfBirth: string; team: string; teamId: string;
};
export type F1Constructor = { position: number; points: number; wins: number; id: string; name: string; nationality: string };
export type F1Race = {
  round: number; name: string; circuit: string; locality: string; country: string;
  date: string; time: string | null; sprint: boolean; qualifying: string | null;
};
export type F1Podium = { position: number; driverId: string; code: string; name: string; team: string; time: string | null };
export type F1Season = {
  season: string; round: number; totalRounds: number;
  drivers: F1Driver[]; constructors: F1Constructor[]; races: F1Race[];
  lastRace: (F1Race & { podium: F1Podium[] }) | null;
  nextRace: F1Race | null;
  title: { decided: boolean; leaderId: string | null; lead: number; maxRemaining: number };
  updatedAt: string;
};
