import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import { SectionHead } from "@/components/mission/primitives";
import { easeOutExpo } from "@/lib/motion";
import type { NewsItem } from "@shared/news";
import type { SportKey } from "./media";
import { isEs, locale, useLang, type Bi } from "@/lib/lang";

export type Recap = { label: string; detail: string; url: string };

const OFFICIAL: Record<SportKey, { name: string; url: string; note: Bi }[]> = {
  f1: [
    { name: "Formula1.com", url: "https://www.formula1.com/", note: { es: "Sitio oficial: resultados, noticias y análisis", en: "Official site: results, news and analysis" } },
    { name: "F1 on YouTube", url: "https://www.youtube.com/@Formula1", note: { es: "Resúmenes oficiales de cada sesión", en: "Official highlights of every session" } },
    { name: "FIA", url: "https://www.fia.com/", note: { es: "Reglamento, sanciones y documentos oficiales", en: "Regulations, penalties and official documents" } },
  ],
  ciclismo: [
    { name: "UCI", url: "https://www.uci.org/", note: { es: "Federación internacional: ranking y calendario", en: "International federation: rankings and calendar" } },
    { name: "Tour de France", url: "https://www.letour.fr/", note: { es: "La Grande Boucle", en: "La Grande Boucle" } },
    { name: "Giro d'Italia", url: "https://www.giroditalia.it/", note: { es: "La corsa rosa", en: "La corsa rosa" } },
    { name: "La Vuelta", url: "https://www.lavuelta.es/", note: { es: "Vuelta a España", en: "Tour of Spain" } },
  ],
  tenis: [
    { name: "ATP Tour", url: "https://www.atptour.com/", note: { es: "Ranking y torneos masculinos", en: "Men's rankings and tournaments" } },
    { name: "WTA", url: "https://www.wtatennis.com/", note: { es: "Ranking y torneos femeninos", en: "Women's rankings and tournaments" } },
    { name: "Nitto ATP Finals", url: "https://www.nittoatpfinals.com/", note: { es: "El torneo de maestros, en Turín", en: "The season finale, in Turin" } },
    { name: "Tennis TV on YouTube", url: "https://www.youtube.com/@TennisTV", note: { es: "Resúmenes oficiales del circuito ATP", en: "Official ATP Tour highlights" } },
  ],
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const es = isEs();
  const ago = (n: number, u: string) => (es ? `hace ${n} ${u}` : `${n} ${u} ago`);
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return ago(Math.max(1, mins), "min");
  const h = Math.round(mins / 60);
  if (h < 24) return ago(h, "h");
  const d = Math.round(h / 24);
  return d < 30 ? ago(d, "d") : new Date(iso).toLocaleDateString(locale(), { day: "2-digit", month: "short" });
}

/** Subapartado "Noticias": resúmenes en video, titulares recientes (RSS) y sitios oficiales. */
export default function NewsPanel({ sport, recaps = [] }: { sport: SportKey; recaps?: Recap[] }) {
  const { data: news, isLoading, isError } = useQuery<NewsItem[]>({
    queryKey: [`/api/sports/news/${sport}`],
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const { L, pick } = useLang();

  return (
    <div className="space-y-20 sm:space-y-24">
      {recaps.length > 0 && (
        <div>
          <SectionHead index="N.1" title={L("Resúmenes en video", "Video highlights")} className="mb-8" />
          <div className="grid gap-4 md:grid-cols-2">
            {recaps.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 border border-foreground bg-foreground p-6 text-background transition-colors hover:bg-signal hover:text-foreground"
              >
                <PlayCircle className="h-12 w-12 shrink-0 transition-transform group-hover:scale-110" strokeWidth={1.4} />
                <div className="min-w-0">
                  <p className="font-display text-2xl sm:text-3xl">{r.label}</p>
                  <p className="label-mono mt-2 opacity-70">{r.detail}</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionHead index={recaps.length ? "N.2" : "N.1"} title={L("Titulares recientes", "Latest headlines")} aside={news?.length ? `${news.length} ${L("notas", "stories")}` : undefined} className="mb-8" />
        {isLoading ? (
          <div className="grid gap-px bg-rock/40 md:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 animate-pulse bg-muted" />)}
          </div>
        ) : isError || !news?.length ? (
          <p className="text-muted-foreground">{L("No hay titulares disponibles ahora mismo. Revisa los sitios oficiales de abajo.", "No headlines available right now. Check the official sites below.")}</p>
        ) : (
          <ul className="grid gap-px bg-rock/40 md:grid-cols-2">
            {news.map((n, i) => (
              <motion.li
                key={n.link}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: easeOutExpo, delay: (i % 2) * 0.06 }}
                className="bg-background"
              >
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="group flex h-full gap-4 p-5 transition-colors hover:bg-muted/50">
                  {n.image && (
                    <img src={n.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-20 w-28 shrink-0 object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                  <div className="min-w-0">
                    <p className="label-mono text-muted-foreground">{n.source} · {timeAgo(n.date)}</p>
                    <p className="mt-2 line-clamp-3 font-medium leading-snug transition-colors group-hover:text-signal">{n.title}</p>
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        )}
        <p className="label-mono mt-4 text-muted-foreground/70">{L("Titulares vía RSS públicos; cada nota abre en su sitio original.", "Headlines via public RSS feeds; each story opens on its original site.")}</p>
      </div>

      <div>
        <SectionHead index={recaps.length ? "N.3" : "N.2"} title={L("Sitios oficiales", "Official sites")} className="mb-8" />
        <ul className="grid gap-px bg-rock/40 sm:grid-cols-2 lg:grid-cols-4">
          {OFFICIAL[sport].map((o) => (
            <li key={o.url} className="bg-background">
              <a href={o.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors hover:bg-muted/50">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-2xl">{o.name}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-signal" />
                </span>
                <span className="text-sm text-muted-foreground">{pick(o.note)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
