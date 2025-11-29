// Contenido para server/mockData.ts

// Definimos los tipos para que TypeScript esté contento
type Ranking = {
  id: string;
  rank: number;
  athleteName: string;
  points: number;
  teamName?: string;
}
type SportEvent = {
  id: string;
  eventName: string;
  date: string; // Usamos string simple para los datos falsos
  location?: string;
}

// 1. LOS RANKINGS
export const mockRankings: Record<string, Ranking[]> = {
  ciclismo: [
    { id: 'c1', rank: 1, athleteName: 'Tadej Pogačar', points: 8500, teamName: "UAE Team Emirates" },
    { id: 'c2', rank: 2, athleteName: 'Jonas Vingegaard', points: 7950, teamName: "Visma" },
    { id: 'c3', rank: 3, athleteName: 'Remco Evenepoel', points: 7200, teamName: "Soudal Quick-Step" },
    { id: 'c4', rank: 4, athleteName: 'Primoz Roglic', points: 7050, teamName: "Red Bull - BORA" },
  ],
  tenis: [
    { id: 't1', rank: 1, athleteName: 'Jannik Sinner', points: 10500 },
    { id: 't2', rank: 2, athleteName: 'Carlos Alcaraz', points: 9800 },
    { id: 't3', rank: 3, athleteName: 'Novak Djokovic', points: 9200 },
  ],
  // Dejamos F1 vacío a propósito, porque usaremos una API real
  f1: [
    { id: 'f1-1', rank: 1, athleteName: 'Lando Norris', points: 390, teamName: "McLaren" },
    { id: 'f1-2', rank: 2, athleteName: 'Oscar Piastri', points: 366, teamName: "McLaren" },
    { id: 'f1-3', rank: 3, athleteName: 'Max Verstappen', points: 366, teamName: "Red Bull Racing" },
    { id: 'f1-4', rank: 4, athleteName: 'George Russell', points: 294, teamName: "Mercedes" },
  ] 
};

// 2. LOS CALENDARIOS
export const mockEvents: Record<string, SportEvent[]> = {
  ciclismo: [
    { id: 'e1', eventName: 'Tour de Francia 2026', date: '2026-07-04', location: "Francia" },
    { id: 'e2', eventName: 'Vuelta a España 2026', date: '2026-08-22', location: "España" },
    { id: 'e3', eventName: 'Giro d\'Italia 2026', date: '2026-05-09', location: "Italia" },
  ],
  tenis: [
    { id: 'e4', eventName: 'Australian Open', date: '2026-01-19', location: "Melbourne" },
    { id: 'e5', eventName: 'Roland Garros', date: '2026-05-24', location: "París" },
    { id: 'e6', eventName: 'Wimbledon', date: '2026-06-29', location: "Londres" },
    { id: 'e7', eventName: 'US Open', date: '2026-08-31', location: "Nueva York" },
  ],
  // Dejamos F1 vacío
  f1: [
    { id: 'e8', eventName: 'CATAR GP', date: '2025-11-30', location: "Circuito Internacional de Losail" },
    { id: 'e9', eventName: 'ABU DABI GP', date: '2025-12-7', location: "Yas Marina Circuit" },
  ]
};