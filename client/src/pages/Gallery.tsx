import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { motion } from "framer-motion";
import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import { SectionHead } from "@/components/mission/primitives";
import { ViewfinderSignature } from "@/components/mission/signatures";
import { easeOutExpo } from "@/lib/motion";
import { pad, updatedSpec, usePosts } from "@/lib/posts";

export default function Gallery() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts("galeria");

  return (
    <>
      <MissionHero
        index="07"
        label={t("nav.gallery")}
        title={t("pages.galleryTitle")}
        description={t("pages.gallerySubtitle")}
        signature={<ViewfinderSignature />}
        loading={isLoading}
        specs={[
          { label: t("ui.frames"), value: posts.length, pad: 3 },
          updatedSpec(t("ui.updated"), posts[0]?.createdAt),
        ]}
        ghost="Exposure"
      />

      <section className="page-container py-20 sm:py-28">
        <SectionHead index="01" title={t("ui.frames")} aside={`${pad(posts.length, 3)} ${t("ui.frames")}`} className="mb-12" />
        {isLoading ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {[260, 180, 320, 220, 200, 280].map((h, i) => (
              <div key={i} className="mb-6 animate-pulse bg-muted" style={{ height: h }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {posts.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group mb-10 block break-inside-avoid">
                <motion.div
                  initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                  whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.3, ease: easeOutExpo, delay: (i % 3) * 0.12 }}
                  className="relative overflow-hidden bg-muted"
                >
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="h-auto w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center p-6 text-center font-medium">{post.title}</div>
                  )}
                  {/* Marco de visor al hover */}
                  <div className="pointer-events-none absolute inset-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-white" />
                    <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-white" />
                    <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white" />
                    <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white" />
                  </div>
                </motion.div>
                <div className="label-mono mt-3 flex justify-between gap-4 text-muted-foreground">
                  <span className="text-foreground">Fig. {pad(i + 1)}</span>
                  <span className="truncate transition-colors group-hover:text-signal">{post.title}</span>
                  <span className="shrink-0">{post.dotDate}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
