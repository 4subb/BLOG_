import { useTranslation } from "react-i18next";
import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import IndexList from "@/components/mission/IndexList";
import { SectionHead } from "@/components/mission/primitives";
import { ScrollReadText, TypeCursorSignature } from "@/components/mission/signatures";
import { pad, usePosts } from "@/lib/posts";

export default function Reading() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts("lectura");
  const minutes = posts.reduce((n, p) => n + p.readMinutes, 0);

  return (
    <>
      <MissionHero
        index="06"
        label={t("nav.reading")}
        title={t("pages.readingTitle")}
        description={
          <>
            {t("pages.readingSubtitle")}
            <span className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-blink bg-signal" />
          </>
        }
        signature={<TypeCursorSignature />}
        specs={[
          { label: t("ui.entries"), value: posts.length, pad: 3 },
          { label: t("ui.minRead"), value: minutes, pad: 3 },
        ]}
        ghost="Marginalia"
      />

      {/* Manifiesto: se ilumina palabra a palabra con el scroll */}
      <section className="page-container py-20 sm:py-32">
        <SectionHead index="01" title={t("ui.dispatch")} className="mb-12" />
        <ScrollReadText text={t("ui.readingManifesto")} className="font-display max-w-[24ch] text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.02]" />
      </section>

      {/* Índice editorial */}
      <section className="page-container pb-24 sm:pb-32">
        <SectionHead index="02" title={t("ui.index")} aside={`${pad(posts.length, 3)} ${t("ui.entries")}`} className="mb-6" />
        {isLoading ? (
          <div className="space-y-px">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse border-t border-rock/50 bg-muted/40" />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <IndexList
            size="md"
            rows={posts.map((p, i) => ({
              key: p.id,
              href: `/post/${p.id}`,
              index: pad(i + 1),
              title: p.title,
              meta: `${p.dotDate} · ${p.readMinutes} min`,
              image: p.imageUrl,
            }))}
          />
        )}
      </section>
    </>
  );
}
