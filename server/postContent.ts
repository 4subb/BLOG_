import type { Post, PostSummary } from "@shared/schema";

// Imágenes embebidas que el editor (Quill) mete en el HTML como data: URLs.
// SVG se queda embebido: servido desde nuestro dominio podría ejecutar scripts.
const DATA_IMAGE = /data:(image\/(?:png|jpe?g|webp|gif|avif));base64,([A-Za-z0-9+/=]+)/g;

type SaveImage = (mimeType: string, base64: string) => Promise<string>; // devuelve el id

/** Sustituye cada data:image por `/api/media/:id`, guardando la imagen con `save`. */
export async function extractInlineImages(html: string, save: SaveImage): Promise<string> {
  const matches = Array.from(html.matchAll(DATA_IMAGE));
  if (matches.length === 0) return html;
  const urls = new Map<string, string>();
  for (const [full, mimeType, base64] of matches) {
    if (!urls.has(full)) urls.set(full, `/api/media/${await save(mimeType, base64)}`);
  }
  return html.replace(DATA_IMAGE, (full) => urls.get(full)!);
}

/** Igual que extractInlineImages pero para un campo que es solo una URL (p. ej. la portada). */
export async function extractImageUrl(url: string | null | undefined, save: SaveImage) {
  if (!url || !url.startsWith("data:image/")) return url;
  return extractInlineImages(url, save);
}

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

export function toPostSummary({ content, ...post }: Post, excerptLength = 150): PostSummary {
  const text = stripHtml(content);
  return {
    ...post,
    excerpt: text.length > excerptLength ? text.slice(0, excerptLength).trimEnd() + "…" : text,
    readMinutes: Math.max(1, Math.round(text.split(" ").length / 200)),
  };
}
