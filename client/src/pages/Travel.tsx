import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Camera } from "lucide-react";
import travelImage from "@assets/stock_images/beautiful_landscape__1091a52c.jpg";

export default function Travel() {
  // TODO: remove mock functionality
  const mockPosts = [
    {
      id: "travel-1",
      title: "Ascenso al Himalaya: Una Aventura Épica",
      excerpt: "Relato fotográfico de una expedición de 15 días al Himalaya, capturando la majestuosidad de las montañas más altas del mundo.",
      category: "Viajes",
      date: "13 Oct 2025",
      imageUrl: travelImage,
      tags: ["Montaña", "Aventura", "Fotografía"],
    },
    {
      id: "travel-2",
      title: "Auroras Boreales en Islandia",
      excerpt: "Guía completa para fotografiar auroras boreales en Islandia, con los mejores lugares y consejos técnicos de fotografía nocturna.",
      category: "Viajes",
      date: "6 Oct 2025",
      imageUrl: travelImage,
      tags: ["Islandia", "Auroras", "Noche"],
    },
    {
      id: "travel-3",
      title: "Ruta por los Alpes Suizos en Bicicleta",
      excerpt: "Experiencia de 7 días recorriendo los Alpes Suizos en bicicleta, con paisajes increíbles y desafíos únicos.",
      category: "Viajes",
      date: "28 Sep 2025",
      tags: ["Ciclismo", "Alpes", "Europa"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-chart-4/10 to-background py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                <Camera className="h-8 w-8 text-chart-4" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-page-title">
                  Viajes y Fotografía
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
                  Aventuras, destinos y fotografías del mundo
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
