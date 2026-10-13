import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Travel() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTravelPosts = async () => {
      try {
        setIsLoading(true);
        // Llamamos a la API de la categoría 'viajes'
        const response = await fetch('/api/posts/categoria/viajes', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar los posts de viajes');
        }

        const data: Post[] = await response.json();
        setPosts(data);

      } catch (error) {
        console.error("Error al cargar posts de viajes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTravelPosts();
  }, []);

  const viewPosts = posts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + "...", // Un poco más largo para vista de lista
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  const recentPosts = viewPosts.slice(0, 3);

  return (
    <>
      <PageHeader
        icon={Camera}
        eyebrow={t('nav.travel')}
        title="Viajes y Fotografía"
        description="Aventuras, destinos increíbles y crónicas del mundo"
      />

      <section className="page-container py-14 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-5">
                {[0, 1, 2].map((i) => <PostCardSkeleton key={i} layout="list" />)}
              </div>
            ) : viewPosts.length === 0 ? (
              <EmptyState icon={Camera} text="No hay posts de viajes todavía. ¡Comparte tu aventura!" />
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
      </section>
    </>
  );
}
