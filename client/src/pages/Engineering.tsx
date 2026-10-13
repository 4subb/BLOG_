import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Engineering() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchEngineeringPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts/categoria/ingenieria', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Error cargando posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEngineeringPosts();
  }, []);

  const viewPosts = posts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  const recentPosts = viewPosts.slice(0, 3);

  return (
    <>
      <PageHeader icon={Code2} eyebrow={t('nav.engineering')} title={t('pages.engTitle')} description={t('pages.engSubtitle')} />

      <section className="page-container py-14 sm:py-20">
        <div className="flex gap-12">
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[0, 1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : viewPosts.length === 0 ? (
              <EmptyState icon={Code2} text="No hay posts todavía." />
            ) : (
              <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {viewPosts.map((post) => (
                  <StaggerItem key={post.id}>
                    <PostCard {...post} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>

          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <RecentPostsSidebar posts={recentPosts} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

