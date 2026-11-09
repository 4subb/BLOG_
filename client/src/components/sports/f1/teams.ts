// Color principal aproximado de cada librea (constructorId de Jolpica). Solo se usa dentro de
// ilustraciones y barras de equipo: es contenido, no un acento de la interfaz.
const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27f4d2",
  ferrari: "#e8002d",
  red_bull: "#3671c6",
  mclaren: "#ff8000",
  aston_martin: "#229971",
  alpine: "#ff87bc",
  williams: "#64c4ff",
  rb: "#6692ff",
  racing_bulls: "#6692ff",
  sauber: "#52e252",
  audi: "#9aa3ab",
  haas: "#b6babd",
  cadillac: "#c9a227",
};

export function teamColor(teamId?: string | null): string {
  return (teamId && TEAM_COLORS[teamId]) || "hsl(var(--signal))";
}
