import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Reading() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts/categoria/lectura', { credentials: 'include' });
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
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  const recentPosts = viewPosts.slice(0, 3);

  return (
    <>
      <PageHeader icon={BookOpen} eyebrow={t('nav.reading')} title={t('pages.readingTitle')} description={t('pages.readingSubtitle')} />

      <section className="page-container py-14 sm:py-20">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-5">
                {[0, 1, 2].map((i) => <PostCardSkeleton key={i} layout="list" />)}
              </div>
            ) : viewPosts.length === 0 ? (
              <EmptyState icon={BookOpen} text="No hay posts todavía." />
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
