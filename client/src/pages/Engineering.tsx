import { useTranslation } from "react-i18next";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import { SectionHead } from "@/components/mission/primitives";
import { BlueprintSignature } from "@/components/mission/signatures";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { pad, updatedSpec, usePosts } from "@/lib/posts";

export default function Engineering() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts("ingenieria");
  const tags = new Set(posts.flatMap((p) => p.tags)).size;

  return (
    <>
      <MissionHero
        index="03"
        label={t("nav.engineering")}
        title={t("pages.engTitle")}
        description={t("pages.engSubtitle")}
        signature={<BlueprintSignature />}
        loading={isLoading}
        specs={[
          { label: t("ui.entries"), value: posts.length, pad: 3 },
          { label: t("ui.tags"), value: tags, pad: 2 },
          updatedSpec(t("ui.updated"), posts[0]?.createdAt),
          { label: t("ui.minRead"), value: posts.reduce((n, p) => n + p.readMinutes, 0), pad: 2 },
        ]}
        ghost="Blueprint"
      />

      <section className="page-container py-20 sm:py-28">
        <SectionHead index="01" title={t("ui.latest")} aside={`${pad(posts.length, 3)} ${t("ui.entries")}`} className="mb-12" />
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <StaggerItem key={post.id}>
                <PostCard {...post} index={i + 1} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
