import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import SectionCard from "@/components/SectionCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import ScrollExpand from "@/components/magic/ScrollExpand";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { easeOutExpo } from "@/lib/motion";
import miFoto from "@/assets/perfil.jpg";

const engineeringImage = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop";
const sportsImage = "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop";
const travelImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";
const readingImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop";
const galleryImage = "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop";

export default function Home() {
  const { t } = useTranslation();

  const sections = [
    { title: t('blog.engTitle'), description: t('blog.engDesc'), imageSrc: engineeringImage, href: "/ingenieria", category: "ingenieria" },
    { title: t('blog.sportsTitle'), description: t('blog.sportsDesc'), imageSrc: sportsImage, href: "/deportes", category: "deportes" },
    { title: t('blog.travelTitle'), description: t('blog.travelDesc'), imageSrc: travelImage, href: "/viajes", category: "viajes" },
    { title: t('blog.readingTitle'), description: t('blog.readingDesc'), imageSrc: readingImage, href: "/lectura", category: "lectura" },
    { title: t('blog.galleryTitle'), description: t('blog.galleryDesc'), imageSrc: galleryImage, href: "/galeria", category: "galeria" },
  ];

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts', { credentials: 'include' });
        if (!response.ok) throw new Error('Error');
        setPosts(await response.json());
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    fetchAllPosts();
  }, []);

  const viewPosts = posts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  const recentPosts = viewPosts.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
        <div className="page-container relative grid items-center gap-14 pb-20 pt-16 sm:pt-24 md:grid-cols-[1fr_auto] md:gap-16 md:pb-28">
          <Stagger stagger={0.09} className="text-center md:text-left">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {t('nav.engineering')} · {t('nav.sports')} · {t('nav.travel')}
              </span>
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                {t('hero.greeting')}{" "}
                <span className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">Ángel Subías</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:mx-0">
                {t('hero.description')}
              </p>
            </StaggerItem>
            <StaggerItem className="mt-9 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/academico">
                <Button size="lg" className="group h-11 rounded-full px-6">
                  {t('nav.academic')}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6">
                <a href="#explorar">{t('blog.explore')}</a>
              </Button>
            </StaggerItem>
          </Stagger>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.15 }}
            className="relative z-10 mx-auto h-72 w-64 shrink-0 md:h-96 md:w-80"
          >
            <ScrollExpand
              src={miFoto}
              alt="Ángel Subías"
              title={t('hero.scrollReveal')}
              scrollHint=""
              startWidth={55}
              startHeight={55}
              startRadius={20}
              endRadius={6}
              mediaZoom={1.2}
              scrollDistance={0.9}
              holdDistance={0.2}
              smoothing={0.12}
              overlayScrim={0.3}
              useWindowScroll={true}
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Secciones */}
      <section id="explorar" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
        <div className="page-container">
          <Stagger inView className="mb-12 max-w-2xl">
            <StaggerItem>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">01</p>
            </StaggerItem>
            <StaggerItem>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl" data-testid="text-sections-title">
                {t('blog.explore')}
              </h2>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-3 text-muted-foreground">{t('blog.exploreDesc')}</p>
            </StaggerItem>
          </Stagger>

          <Stagger inView stagger={0.08} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <StaggerItem key={section.category}>
                <SectionCard {...section} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Últimas publicaciones */}
      <section className="border-t border-border/60 py-20 sm:py-28">
        <div className="page-container">
          <div className="flex flex-col gap-14 lg:flex-row">
            <div className="min-w-0 flex-1">
              <Stagger inView className="mb-10">
                <StaggerItem>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">02</p>
                </StaggerItem>
                <StaggerItem>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{t('blog.latest')}</h2>
                </StaggerItem>
              </Stagger>

              {isLoading ? (
                <div className="space-y-5">
                  {[0, 1, 2].map((i) => <PostCardSkeleton key={i} layout="list" />)}
                </div>
              ) : viewPosts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{t('blog.empty')}</p>
              ) : (
                <Stagger className="space-y-5">
                  {viewPosts.map((post) => (
                    <StaggerItem key={post.id}>
                      <PostCard {...post} layout="list" />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>

            <aside className="w-full lg:w-72 lg:shrink-0">
              <div className="sticky top-24">
                <RecentPostsSidebar posts={recentPosts} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
