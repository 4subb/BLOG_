import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import { queryClient } from "@/lib/queryClient";

export type Geo = { city?: string; region?: string; countryCode?: string; precise?: boolean };

const GEO_KEY = ["/api/geo"];
const PRECISE_STORAGE = "geo-precise";
const PRECISE_TTL = 12 * 60 * 60 * 1000;

/** Zona horaria del dispositivo: la hora siempre es la local del visitante, sin pedir permisos. */
export const deviceTimeZone = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined; } catch { return undefined; }
};

// Ubicación precisa guardada (la eligió el visitante con permiso), válida unas horas
function storedPrecise(): Geo | undefined {
  try {
    const raw = localStorage.getItem(PRECISE_STORAGE);
    if (!raw) return undefined;
    const { geo, at } = JSON.parse(raw) as { geo: Geo; at: number };
    return Date.now() - at < PRECISE_TTL ? geo : undefined;
  } catch { return undefined; }
}

/**
 * Ubicación del visitante: aproximada por IP (sin permisos) o precisa si la pidió.
 * Una sola petición por sesión aunque haya varios relojes en la página.
 */
export function useVisitorLocation() {
  const { data } = useQuery<Geo>({
    queryKey: GEO_KEY,
    queryFn: async () => {
      const precise = storedPrecise();
      if (precise) return precise;
      const res = await fetch("/api/geo");
      return res.ok ? res.json() : {};
    },
    staleTime: Infinity,
    retry: false,
  });
  return data;
}

/** Ciudad a partir de la zona horaria ("America/Monterrey" → "Monterrey"), para cuando no hay datos. */
const cityFromTimeZone = (tz?: string) => tz?.split("/").pop()?.replace(/_/g, " ");

/** Etiqueta corta para la telemetría: "Monterrey, MX". */
export function locationLabel(geo?: Geo) {
  if (geo?.city) return geo.countryCode ? `${geo.city}, ${geo.countryCode}` : geo.city;
  return cityFromTimeZone(deviceTimeZone()) ?? "—";
}

/** Nombre del país en el idioma activo ("MX" → "México"). */
export function countryName(code?: string) {
  if (!code) return undefined;
  try { return new Intl.DisplayNames([i18n.language], { type: "region" }).of(code); } catch { return code; }
}

export const canUsePreciseLocation = () => typeof navigator !== "undefined" && "geolocation" in navigator;

/**
 * Pide permiso de ubicación al navegador y traduce las coordenadas a ciudad.
 * Solo se llama desde un clic del usuario (nunca al cargar la página).
 */
export function requestPreciseLocation(): Promise<Geo> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
            localityLanguage: i18n.language.startsWith("en") ? "en" : "es",
          });
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`);
          const data = await res.json() as { city?: string; locality?: string; principalSubdivision?: string; countryCode?: string };
          const geo: Geo = {
            city: data.city || data.locality || undefined,
            region: data.principalSubdivision || undefined,
            countryCode: data.countryCode || undefined,
            precise: true,
          };
          try { localStorage.setItem(PRECISE_STORAGE, JSON.stringify({ geo, at: Date.now() })); } catch {}
          queryClient.setQueryData(GEO_KEY, geo);
          resolve(geo);
        } catch (err) { reject(err); }
      },
      reject,
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 30 * 60 * 1000 },
    );
  });
}
