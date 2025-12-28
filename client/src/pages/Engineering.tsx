import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
// import { Link } from "wouter"; // <-- ¡YA NO LO NECESITAMOS AQUÍ!
import Header from "@/components/Header";
import PostCard from "@/components/PostCard"; 
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Code2 } from "lucide-react";

export default function Engineering() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Preparamos los datos (El "truco" para que sea automático)
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
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        
        <div className="bg-gradient-to-b from-muted/30 to-background py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Code2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold">Ingeniería</h1>
                <p className="text-muted-foreground mt-2">Proyectos, código y documentación técnica</p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <div className="flex-1">
                {isLoading ? (
                  <p>Cargando posts...</p>
                ) : viewPosts.length === 0 ? (
                  <p>No hay posts todavía.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ¡AQUÍ ESTÁ EL ARREGLO! */}
                    {/* Quitamos el <Link> envolvente. PostCard ya tiene el link adentro. */}
                    {viewPosts.map((post) => (
                      <PostCard key={post.id} {...post} />
                    ))}
                  </div>
                )}
              </div>

              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-20">
                  <RecentPostsSidebar posts={recentPosts} />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}