import { useQuery } from "@tanstack/react-query";
import type { F1Driver, F1Race, F1Season } from "@shared/f1";
import { isEs, locale } from "@/lib/lang";

export type { F1Driver, F1Race, F1Season };

export function useF1Season() {
  return useQuery<F1Season>({
    queryKey: ["/api/f1/season"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

const COUNTRY_ES: Record<string, string> = {
  Australia: "Australia", China: "China", Japan: "Japón", USA: "EE. UU.", "United States": "EE. UU.",
  Canada: "Canadá", Monaco: "Mónaco", Spain: "España", Austria: "Austria", UK: "Reino Unido",
  Belgium: "Bélgica", Hungary: "Hungría", Netherlands: "Países Bajos", Italy: "Italia",
  Azerbaijan: "Azerbaiyán", Singapore: "Singapur", Mexico: "México", Brazil: "Brasil",
  Qatar: "Catar", UAE: "Emiratos Árabes", Bahrain: "Baréin", "Saudi Arabia": "Arabia Saudita", Malaysia: "Malasia",
};
/** Nombre del país en el idioma activo (la API lo da en inglés). */
export const countryEs = (c: string) => (isEs() ? COUNTRY_ES[c] ?? c : c === "USA" ? "United States" : c);

const NATIONALITY_ES: Record<string, string> = {
  Italian: "Italia", Dutch: "Países Bajos", British: "Reino Unido", Monegasque: "Mónaco", Spanish: "España",
  Australian: "Australia", German: "Alemania", French: "Francia", Mexican: "México", Brazilian: "Brasil",
  Canadian: "Canadá", Thai: "Tailandia", Japanese: "Japón", Finnish: "Finlandia", Danish: "Dinamarca",
  Chinese: "China", "New Zealander": "Nueva Zelanda", Argentine: "Argentina", Argentinian: "Argentina", American: "EE. UU.",
};
/** Nacionalidad: en español el país ("Italia"); en inglés el gentilicio de la API ("Italian"). */
export const nationalityEs = (n: string) => (isEs() ? NATIONALITY_ES[n] ?? n : n);

/** "GP · São Paulo": la API da el nombre en inglés; la ciudad distingue los GP repetidos por país. */
export const raceLabel = (r: Pick<F1Race, "locality">) => `GP · ${r.locality}`;

export function ageOn(dateOfBirth: string, on = new Date()) {
  const dob = new Date(dateOfBirth);
  let years = on.getFullYear() - dob.getFullYear();
  const birthdayThisYear = new Date(on.getFullYear(), dob.getMonth(), dob.getDate());
  if (on < birthdayThisYear) years--;
  const lastBirthday = new Date(dob.getFullYear() + years, dob.getMonth(), dob.getDate());
  const days = Math.floor((on.getTime() - lastBirthday.getTime()) / 86_400_000);
  return { years, days };
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }) =>
  new Date(iso).toLocaleDateString(locale(), opts).replace(".", "");

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(locale(), { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
