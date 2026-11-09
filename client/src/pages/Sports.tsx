import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import EmptyMission from "@/components/mission/EmptyMission";
import { SectionHead } from "@/components/mission/primitives";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import SportsHero, { SPORTS } from "@/components/sports/SportsHero";
import HistoryPanel from "@/components/sports/HistoryPanel";
import NewsPanel from "@/components/sports/NewsPanel";
import ManualSeason from "@/components/sports/ManualSeason";
import F1Season, { f1LiveFacts, f1Recaps } from "@/components/sports/f1/F1Season";
import { teamColor } from "@/components/sports/f1/teams";
import type { SportKey } from "@/components/sports/media";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { pad, usePosts } from "@/lib/posts";
import { useF1Season } from "@/lib/f1";
import { useLang, type Bi } from "@/lib/lang";

type Tab = "temporada" | "historia" | "noticias";
const TABS: { key: Tab; label: Bi }[] = [
  { key: "temporada", label: { es: "Temporada", en: "Season" } },
  { key: "historia", label: { es: "Historia", en: "History" } },
  { key: "noticias", label: { es: "Noticias", en: "News" } },
];

const isSport = (v: string | null): v is SportKey => v === "f1" || v === "ciclismo" || v === "tenis";
const isTab = (v: string | null): v is Tab => v === "temporada" || v === "historia" || v === "noticias";

/** Estado en la URL (?d=f1&s=historia) para poder compartir o recargar sin perder la vista. */
function useSportsState() {
  const read = () => {
    const q = new URLSearchParams(window.location.search);
    return { sport: isSport(q.get("d")) ? (q.get("d") as SportKey) : "f1", tab: isTab(q.get("s")) ? (q.get("s") as Tab) : "temporada" };
  };
  const [state, setState] = useState(read);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set("d", state.sport);
    q.set("s", state.tab);
    window.history.replaceState(null, "", `${window.location.pathname}?${q.toString()}`);
  }, [state]);
  return [state, setState] as const;
}

export default function Sports() {
  const [{ sport, tab }, setState] = useSportsState();
  const { data: f1 } = useF1Season();
  const { posts, isLoading } = usePosts("deportes");
  const contentRef = useRef<HTMLDivElement>(null);

  // Al cambiar de vista: si ya bajaste más allá del inicio del contenido, vuelve a su arriba
  // (sin saltar a ninguna sección inferior); si estás más arriba, no se mueve nada.
  const keepPlace = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const selectSport = (s: SportKey) => { setState((st) => ({ ...st, sport: s })); keepPlace(); };
  const selectTab = (t: Tab) => { setState((st) => ({ ...st, tab: t })); keepPlace(); };

  const leaderColor = f1 ? teamColor(f1.drivers[0]?.teamId) : undefined;
  const { L, pick } = useLang();
  const sportLabel = pick(SPORTS.find((s) => s.key === sport)!.label);

  return (
    <>
      <SportsHero sport={sport} onSport={selectSport} accent={leaderColor} />

      {/* Barra fija: deporte (compacto) + subapartados */}
      <nav className="sticky top-16 z-20 border-b border-rock/40 bg-background/85 backdrop-blur">
        <div className="page-container flex items-center justify-between gap-6 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label={L(`Apartados de ${sportLabel}`, `${sportLabel} sections`)} className="flex gap-1">
            {TABS.map((t, i) => {
              const on = t.key === tab;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => selectTab(t.key)}
                  className={cn("label-mono relative shrink-0 px-3 py-2 transition-colors", on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <span className={on ? "text-signal" : ""}>({String(i + 1).padStart(2, "0")})</span> {pick(t.label)}
                  {on && <motion.span layoutId="sports-tab-line" className="absolute inset-x-3 -bottom-2.5 h-0.5 bg-signal" />}
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 gap-3 sm:flex">
            {SPORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => selectSport(s.key)}
                className={cn("label-mono transition-colors", s.key === sport ? "text-foreground" : "text-muted-foreground/70 hover:text-foreground")}
              >
                {s.key === sport && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />}
                {pick(s.label)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div ref={contentRef} className="page-container min-h-[60vh] py-16 sm:py-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${sport}-${tab}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
          >
            <SectionHead
              index={`${String(SPORTS.findIndex((s) => s.key === sport) + 1).padStart(2, "0")}.${String(TABS.findIndex((t) => t.key === tab) + 1)}`}
              title={`${sportLabel} · ${pick(TABS.find((t) => t.key === tab)!.label)}${tab === "temporada" && sport === "f1" && f1 ? ` ${f1.season}` : ""}`}
              aside={tab === "temporada" && sport === "f1" && f1 ? `${L("Ronda", "Round")} ${f1.round}/${f1.totalRounds}` : undefined}
              className="mb-12"
            />

            {tab === "temporada" && (sport === "f1" ? <F1Season onGoNews={() => selectTab("noticias")} /> : <ManualSeason sport={sport} />)}

            {tab === "historia" && <HistoryPanel sport={sport} live={sport === "f1" && f1 ? f1LiveFacts(f1) : []} />}

            {tab === "noticias" && (
              <div className="space-y-20 sm:space-y-24">
                <NewsPanel sport={sport} recaps={sport === "f1" && f1 ? f1Recaps(f1) : []} />
                <div>
                  <SectionHead index="N.B" title={L("Desde el blog", "From the blog")} aside={`${pad(posts.length, 3)} ${L("entradas", "entries")}`} className="mb-10" />
                  {isLoading ? (
                    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <PostCardSkeleton key={i} />)}</div>
                  ) : posts.length === 0 ? (
                    <EmptyMission />
                  ) : (
                    <Stagger inView className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                      {posts.map((post, i) => (
                        <StaggerItem key={post.id}><PostCard {...post} index={i + 1} /></StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
