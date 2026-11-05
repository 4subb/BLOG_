import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import IndexList from "@/components/mission/IndexList";
import { Brackets, SectionHead } from "@/components/mission/primitives";
import { ScrollReadText, useTilt } from "@/components/mission/signatures";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { easeOutExpo } from "@/lib/motion";
import { countryList, pad, siteUpdatedAt, updatedSpec, usePosts } from "@/lib/posts";
import miFoto from "@/assets/perfil.jpg";

const sectionImages: Record<string, string> = {
  ingenieria: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
  deportes: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
  viajes: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
  lectura: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
  galeria: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop",
};

function Portrait() {
  const tilt = useTilt(8);
  return (
    <motion.figure
      initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.4, ease: easeOutExpo, delay: 0.3 }}
      className="w-56 sm:w-64"
    >
      <motion.div {...tilt} className="relative p-3">
        <Brackets size={16} />
        <img src={miFoto} alt="Ángel Subías" className="aspect-[4/5] w-full object-cover grayscale transition-[filter] duration-700 hover:grayscale-0" />
      </motion.div>
      <figcaption className="label-mono mt-3 flex justify-between text-muted-foreground">
        <span>Fig. 01</span>
        <span>SLP · MX</span>
      </figcaption>
    </motion.figure>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts();

  const countries = countryList(posts).length;
  const count = (category: string) => posts.filter((p) => p.category === category).length;

  const sections = [
    { key: "ingenieria", href: "/ingenieria", title: t("nav.engineering") },
    { key: "deportes", href: "/deportes", title: t("nav.sports") },
    { key: "viajes", href: "/viajes", title: t("nav.travel") },
    { key: "lectura", href: "/lectura", title: t("nav.reading") },
    { key: "galeria", href: "/galeria", title: t("nav.gallery") },
  ];

  return (
    <>
      <MissionHero
        index="01"
        label={t("nav.home")}
        title="Ángel Subías"
        aside={<Portrait />}
        description={t("ui.homeIntro")}
        actions={
          <>
            <Link href="/academico">
              <Button size="lg" className="group h-12 rounded-full px-6">
                {t("nav.academic")}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-rock px-6">
              <a href="#indice">{t("ui.explore")}</a>
            </Button>
          </>
        }
        loading={isLoading}
        specs={[
          { label: t("ui.entries"), value: posts.length, pad: 3 },
          { label: t("ui.sections"), value: sections.length, pad: 2 },
          { label: t("ui.countries"), value: countries, pad: 2 },
          updatedSpec(t("ui.updated"), siteUpdatedAt(posts)),
        ]}
        ghost="Mission log"
      />

      {/* (02) Índice de secciones */}
      <section id="indice" className="page-container scroll-mt-20 py-20 sm:py-28">
        <SectionHead index="02" title={t("ui.index")} aside={`${pad(sections.length)} ${t("ui.sections")}`} className="mb-6" />
        <IndexList
          rows={sections.map((s, i) => ({
            key: s.key,
            href: s.href,
            index: pad(i + 1),
            title: s.title,
            meta: `${pad(count(s.key), 3)} ${t("ui.entries")}`,
            image: sectionImages[s.key],
          }))}
        />
      </section>

      {/* (03) Bitácora: texto que se ilumina al hacer scroll */}
      <section className="page-container py-20 sm:py-28">
        <SectionHead index="03" title={t("ui.about")} aside={<Link href="/academico" className="hover:text-signal">{t("nav.academic")} ↗</Link>} className="mb-12" />
        <ScrollReadText text={t("hero.description")} className="font-display max-w-[22ch] text-[clamp(1.9rem,4.4vw,4.2rem)] leading-[1.02] sm:max-w-[26ch]" />
      </section>

      {/* (04) Últimas entradas */}
      <section className="page-container py-20 sm:py-28">
        <SectionHead index="04" title={t("ui.latest")} aside={`${pad(posts.length, 3)} ${t("ui.entries")}`} className="mb-12" />
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <Stagger inView className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 6).map((post, i) => (
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
