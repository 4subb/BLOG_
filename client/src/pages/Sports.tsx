import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Trophy } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-chart-2/10 to-background py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <Trophy className="h-8 w-8 text-chart-2" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-page-title">
                  Deportes
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
                  Noticias y seguimiento de ciclismo, tenis y F1
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
