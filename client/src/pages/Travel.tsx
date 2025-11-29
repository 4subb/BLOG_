import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard"; // Usamos el PostCard Maestro
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Camera } from "lucide-react";

export default function Travel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTravelPosts = async () => {
      try {
        setIsLoading(true);
        // Llamamos a la API de la categoría 'viajes'
        const response = await fetch('http://localhost:5000/api/posts/categoria/viajes', {
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

  // 1. PREPARAMOS LOS DATOS (Igual que en Ingeniería)
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
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        
        {/* Héroe de la sección Viajes */}
        <div className="bg-gradient-to-b from-muted/30 to-background py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold">
                  Viajes y Fotografía
                </h1>
                <p className="text-muted-foreground mt-2">
                  Aventuras, destinos increíbles y crónicas del mundo
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8 flex-col lg:flex-row">
              
              {/* COLUMNA PRINCIPAL (Lista Vertical) */}
              <div className="flex-1">
                {isLoading ? (
                  <p>Cargando posts de viajes...</p>
                ) : viewPosts.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay posts de viajes todavía. ¡Comparte tu aventura!</p>
                  </div>
                ) : (
                  // 2. ¡AQUÍ ESTÁ EL CAMBIO DE DISEÑO!
                  // Usamos 'flex-col' y 'gap-8' para una lista vertical elegante (uno por fila)
                  <div className="flex flex-col gap-8">
                    {viewPosts.map((post) => (
                      <PostCard key={post.id} {...post} />
                    ))}
                  </div>
                )}
              </div>

              <aside className="w-full lg:w-80 lg:flex-shrink-0">
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