import { useTranslation } from "react-i18next";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import IndexList from "@/components/mission/IndexList";
import { SectionHead } from "@/components/mission/primitives";
import { FlightSignature } from "@/components/mission/signatures";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { countryList, pad, usePosts } from "@/lib/posts";

export default function Travel() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts("viajes");
  const countries = countryList(posts);

  return (
    <>
      <MissionHero
        index="05"
        label={t("nav.travel")}
        title={t("pages.travelTitle")}
        description={t("pages.travelSubtitle")}
        signature={<FlightSignature />}
        loading={isLoading}
        specs={[
          { label: t("ui.entries"), value: posts.length, pad: 3 },
          { label: t("ui.countries"), value: countries.length, pad: 2 },
        ]}
        ghost="Coordinates"
      />

      {/* Bitácora de destinos: índice con vista previa flotante */}
      {countries.length > 0 && (
        <section className="page-container py-20 sm:py-28">
          <SectionHead index="01" title={t("ui.countries")} aside={`${pad(countries.length)} ${t("ui.countries")}`} className="mb-6" />
          <IndexList
            rows={countries.map((country, i) => {
              const first = country.posts[0];
              return { key: country.key, href: `/post/${first.id}`, index: pad(i + 1), title: country.label, meta: `${pad(country.posts.length, 3)} ${t("ui.entries")}`, image: first.imageUrl };
            })}
          />
        </section>
      )}

      <section className="page-container pb-24 pt-4 sm:pb-32">
        <SectionHead index={countries.length > 0 ? "02" : "01"} title={t("ui.latest")} aside={`${pad(posts.length, 3)} ${t("ui.entries")}`} className="mb-12" />
        {isLoading ? (
          <div className="space-y-14">{[0, 1].map((i) => <PostCardSkeleton key={i} layout="list" />)}</div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <Stagger className="space-y-16">
            {posts.map((post, i) => (
              <StaggerItem key={post.id}>
                <PostCard {...post} index={i + 1} layout="list" />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
