import Header from "@/components/Header";
import SportsTabs from "@/components/SportsTabs";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Trophy, Calendar } from "lucide-react";
import { Link } from "wouter";
import sportsImage from "@assets/stock_images/professional_cyclist_f2d23366.jpg";

export default function Sports() {
  // TODO: remove mock functionality
  const mockPosts = [
    {
      id: "sports-1",
      title: "Tour de Francia 2025: Análisis de la Etapa Reina",
      excerpt: "Análisis detallado de la etapa de montaña más exigente del Tour de Francia, con los mejores momentos y estrategias de los equipos.",
      category: "Deportes",
      date: "12 Oct 2025",
      imageUrl: sportsImage,
      tags: ["Ciclismo", "Tour de Francia"],
    },
    {
      id: "sports-2",
      title: "US Open 2025: Final Épica",
      excerpt: "Resumen completo de la final del US Open de tenis con todos los detalles del partido que definió al nuevo campeón.",
      category: "Deportes",
      date: "8 Oct 2025",
      tags: ["Tenis", "Grand Slam"],
    },
    {
      id: "sports-3",
      title: "GP de Japón F1: Análisis Técnico",
      excerpt: "Análisis técnico del Gran Premio de Japón de Fórmula Uno, estrategias de neumáticos y rendimiento de los monoplazas.",
      category: "Deportes",
      date: "1 Oct 2025",
      imageUrl: sportsImage,
      tags: ["F1", "Fórmula Uno"],
    },
  ];

  const recentPosts = [
    { id: "sports-1", title: "Tour de Francia 2025: Análisis de la Etapa Reina", category: "Deportes", date: "12 Oct 2025" },
    { id: "eng-1", title: "Sistema de Control IoT con Arduino", category: "Ingeniería", date: "14 Oct 2025" },
    { id: "travel-1", title: "Ascenso al Himalaya: Una Aventura Épica", category: "Viajes", date: "13 Oct 2025" },
  ];

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
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-page-title">
                  Deportes
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
                  Ciclismo, Tenis y Fórmula Uno
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <div className="flex-1">
                <SportsTabs />

                <div className="mt-12">
                  <h2 className="text-2xl font-heading font-bold mb-6">Últimas Noticias</h2>
                  <div className="space-y-6">
                    {mockPosts.map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`}>
                        <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300" data-testid={`card-post-${post.id}`}>
                          <div className="flex flex-col md:flex-row">
                            {post.imageUrl && (
                              <div className="md:w-1/3 h-48 md:h-auto">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{post.date}</span>
                              </div>
                              <h3 className="text-xl font-heading font-semibold mb-3">{post.title}</h3>
                              <p className="text-muted-foreground">{post.excerpt}</p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
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
