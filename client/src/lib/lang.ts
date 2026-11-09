import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

/** Texto en los dos idiomas, junto a donde se usa. */
export type Bi = { es: string; en: string };

export const isEs = (lng = i18n.language) => (lng ?? "es").startsWith("es");

/** Locale para fechas y números según el idioma activo. */
export const locale = (lng?: string) => (isEs(lng) ? "es-MX" : "en-US");

/** Escoge el texto del idioma activo (fuera de React; dentro, usa useLang para re-renderizar). */
export const pick = (b: Bi | string, lng?: string) => (typeof b === "string" ? b : isEs(lng) ? b.es : b.en);

/**
 * Hook bilingüe: `L("Temporada", "Season")` devuelve el texto del idioma activo y el componente se
 * vuelve a pintar al pulsar el botón de idioma.
 */
export function useLang() {
  const { i18n: inst } = useTranslation();
  const es = isEs(inst.language);
  return {
    es,
    lang: es ? ("es" as const) : ("en" as const),
    locale: es ? "es-MX" : "en-US",
    L: (esText: string, enText: string) => (es ? esText : enText),
    pick: (b: Bi | string) => pick(b, inst.language),
  };
}

/** Versión sin hook de L() para funciones puras (el componente que las llama debe usar useLang). */
export const tr = (esText: string, enText: string, lng?: string) => (isEs(lng) ? esText : enText);
