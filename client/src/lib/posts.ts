import { useQuery } from "@tanstack/react-query";
import i18n from "i18next";
import type { PostSummary } from "@shared/schema";
import type { Spec } from "@/components/mission/primitives";

export type ViewPost = Omit<PostSummary, "imageUrl" | "country" | "tags"> & {
  date: string;
  dotDate: string;
  imageUrl?: string;
  country?: string;
  tags: string[];
};

export const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

/** Fecha técnica: 12.10.2026 */
export const dotDate = (d: Date | string) => {
  const date = new Date(d);
  return [date.getDate(), date.getMonth() + 1].map((n) => String(n).padStart(2, "0")).join(".") + "." + date.getFullYear();
};

/** Spec "Actualizado" sin ambigüedad día/mes: "05 ene" + año como unidad (o "—" si no hay fecha). */
export function updatedSpec(label: string, d?: Date | string): Spec {
  if (!d) return { label, value: "—" };
  const date = new Date(d);
  const value = date.toLocaleDateString(i18n.language, { day: "2-digit", month: "short" }).replace(".", "");
  return { label, value, unit: String(date.getFullYear()) };
}

/**
 * Última actualización del sitio: lo más reciente entre el último cambio publicado (commit del
 * build: diseño, CV, correo…) y el post más nuevo.
 */
export function siteUpdatedAt(posts: { createdAt: Date | string }[]): Date {
  const dates = [new Date(__SITE_UPDATED_AT__), ...posts.map((p) => new Date(p.createdAt))];
  return new Date(Math.max(...dates.map((d) => d.getTime()).filter((n) => !Number.isNaN(n))));
}

// --- Países ---
// En la BD el país es texto libre ("México", "MÉXICO", "Mexico", "México, Argentina"):
// se separa por comas y se normaliza (sin acentos, minúsculas) para contar y agrupar.
const countryKey = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
const splitCountries = (raw?: string | null) =>
  (raw ?? "").split(/[,/;]| y | and /i).map((s) => s.trim()).filter(Boolean);

/** Países distintos entre los posts, con la grafía más completa (con acentos) como etiqueta. */
export function countryList(posts: ViewPost[]): { key: string; label: string; posts: ViewPost[] }[] {
  const byKey = new Map<string, { key: string; label: string; posts: ViewPost[] }>();
  for (const post of posts) {
    for (const name of splitCountries(post.country)) {
      const key = countryKey(name);
      const entry = byKey.get(key) ?? { key, label: name, posts: [] };
      // Prefiere la variante con acentos y en formato título ("México" sobre "MEXICO")
      const pretty = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      if (name.normalize("NFD").length > entry.label.normalize("NFD").length || entry.label === entry.label.toUpperCase()) entry.label = pretty;
      if (!entry.posts.includes(post)) entry.posts.push(post);
      byKey.set(key, entry);
    }
  }
  return Array.from(byKey.values());
}

export function toViewPost(post: PostSummary): ViewPost {
  return {
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(i18n.language),
    dotDate: dotDate(post.createdAt),
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || [],
  };
}

/** Posts publicados (todos o por categoría), cacheados por React Query entre páginas. */
export function usePosts(category?: string) {
  const query = useQuery<PostSummary[]>({
    queryKey: category ? ["/api/posts/categoria", category] : ["/api/posts"],
    staleTime: 60_000,
  });
  const posts = (query.data ?? []).map(toViewPost);
  return { posts, isLoading: query.isLoading };
}

export const pad = (n: number, size = 2) => String(n).padStart(size, "0");
