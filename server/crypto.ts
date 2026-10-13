import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// Cifrado simétrico (AES-256-GCM) para secretos guardados en BD, p. ej. tokens de Spotify.
// La clave se deriva de SESSION_SECRET: si se rota ese secreto, los tokens guardados dejan de
// poder descifrarse y basta con volver a conectar.
const key = createHash("sha256").update(`token-encryption:${process.env.SESSION_SECRET ?? ""}`).digest();

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decryptSecret(payload: string): string | null {
  try {
    const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
