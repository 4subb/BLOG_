// Ubicación aproximada del visitante a partir de su IP (sin pedir permiso al navegador).
// Se consulta desde el servidor para que la IP no salga del navegador hacia terceros;
// el resultado se guarda solo en memoria y nunca en la base de datos.

export type Geo = { city?: string; region?: string; countryCode?: string };

const TTL = 6 * 60 * 60 * 1000; // 6 h: la IP de un visitante rara vez cambia de ciudad antes
const MAX_ENTRIES = 5_000;
const cache = new Map<string, { geo: Geo; expiresAt: number }>();

// IPs locales/privadas: en desarrollo el visitante es la propia máquina
const PRIVATE_IP = /^(::1$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|f[cd][0-9a-f]{2}:|fe80:)/i;

export async function lookupIp(rawIp: string | undefined): Promise<Geo> {
  const ip = (rawIp ?? "").replace(/^::ffff:/, "");
  const isPrivate = !ip || PRIVATE_IP.test(ip);
  // En producción una IP privada significa que no sabemos quién es: mejor no adivinar (saldría
  // la ubicación del servidor). En desarrollo se consulta la IP pública de la máquina local.
  if (isPrivate && process.env.NODE_ENV === "production") return {};

  const key = isPrivate ? "self" : ip;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.geo;

  let geo: Geo = {};
  try {
    const url = `https://ipwho.is/${isPrivate ? "" : encodeURIComponent(ip)}?fields=success,city,region,country_code`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const data = (await res.json()) as { success?: boolean; city?: string; region?: string; country_code?: string };
    if (data.success) {
      geo = {
        city: data.city || undefined,
        region: data.region?.replace(/^(Estado|State|Provincia|Province) de /i, "") || undefined,
        countryCode: data.country_code || undefined,
      };
    }
  } catch {
    // Sin conexión o servicio caído: el cliente usa la zona horaria del navegador
  }

  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  cache.set(key, { geo, expiresAt: Date.now() + TTL });
  return geo;
}
