import Header from "@/components/Header";
import CountryFilter from "@/components/CountryFilter";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import travelImage from "@assets/stock_images/beautiful_landscape__1091a52c.jpg";

export default function Travel() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // TODO: remove mock functionality
  const mockPosts = [
    {
      id: "travel-1",
      title: "Ascenso al Himalaya: Una Aventura Épica",
      excerpt: "Relato fotográfico de una expedición de 15 días al Himalaya, capturando la majestuosidad de las montañas más altas del mundo.",
      category: "Viajes",
      date: "13 Oct 2025",
      imageUrl: travelImage,
      country: "Nepal",
      tags: ["Montaña", "Aventura", "Fotografía"],
    },
    {
      id: "travel-2",
      title: "Auroras Boreales en Islandia",
      excerpt: "Guía completa para fotografiar auroras boreales en Islandia, con los mejores lugares y consejos técnicos de fotografía nocturna.",
      category: "Viajes",
      date: "6 Oct 2025",
      imageUrl: travelImage,
      country: "Islandia",
      tags: ["Auroras", "Noche"],
    },
    {
      id: "travel-3",
      title: "Ruta por los Alpes Suizos en Bicicleta",
      excerpt: "Experiencia de 7 días recorriendo los Alpes Suizos en bicicleta, con paisajes increíbles y desafíos únicos.",
      category: "Viajes",
      date: "28 Sep 2025",
      country: "Suiza",
      tags: ["Ciclismo", "Alpes", "Europa"],
    },
  ];

  const countries = Array.from(new Set(mockPosts.map(p => p.country)));
  const filteredPosts = selectedCountry
    ? mockPosts.filter(p => p.country === selectedCountry)
    : mockPosts;

  const recentPosts = [
    { id: "travel-1", title: "Ascenso al Himalaya: Una Aventura Épica", category: "Viajes", date: "13 Oct 2025" },
    { id: "sports-1", title: "Tour de Francia 2025: Análisis de la Etapa Reina", category: "Deportes", date: "12 Oct 2025" },
    { id: "eng-1", title: "Sistema de Control IoT con Arduino", category: "Ingeniería", date: "14 Oct 2025" },
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
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-page-title">
                  Viajes y Fotografía
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
                  Aventuras y destinos del mundo
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="sticky top-20">
                  <CountryFilter
                    countries={countries}
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                  />
                </div>
              </aside>

              <div className="flex-1">
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300" data-testid={`card-post-${post.id}`}>
                        {post.imageUrl && (
                          <div className="w-full h-64 md:h-80">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{post.country}</span>
                            </div>
                          </div>
                          <h2 className="text-2xl font-heading font-semibold mb-3">{post.title}</h2>
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          <div className="flex gap-2 flex-wrap">
                            {post.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
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
