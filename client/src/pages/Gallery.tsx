import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import { Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { springSnappy } from "@/lib/motion";

export default function Gallery() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts/categoria/galeria', { credentials: 'include' });
        if (!response.ok) throw new Error('Error');
        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const viewPosts = posts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    imageUrl: post.imageUrl || undefined,
  }));

  return (
    <>
      <PageHeader icon={ImageIcon} eyebrow={t('nav.gallery')} title={t('pages.galleryTitle')} description={t('pages.gallerySubtitle')} />

      <section className="page-container py-14 sm:py-20">
        {isLoading ? (
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
            {[260, 180, 320, 220, 200, 280, 240, 190].map((h, i) => (
              <div key={i} className="mb-4 animate-pulse rounded-xl bg-muted" style={{ height: h }} />
            ))}
          </div>
        ) : viewPosts.length === 0 ? (
          <EmptyState icon={ImageIcon} text="No hay imágenes todavía." />
        ) : (
          <Stagger stagger={0.05} className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
            {viewPosts.map((post) => (
              <StaggerItem key={post.id} className="mb-4 break-inside-avoid">
                <Link href={`/post/${post.id}`} className="block rounded-xl">
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={springSnappy}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted"
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center">
                        <span className="px-4 text-center text-sm font-medium">{post.title}</span>
                      </div>
                    )}

                    {/* Overlay al hover */}
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <h3 className="translate-y-2 truncate text-sm font-medium text-white transition-transform duration-300 ease-out-expo group-hover:translate-y-0">{post.title}</h3>
                      <p className="translate-y-2 text-xs text-white/70 transition-transform [transition-delay:40ms] duration-300 ease-out-expo group-hover:translate-y-0">{post.date}</p>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
