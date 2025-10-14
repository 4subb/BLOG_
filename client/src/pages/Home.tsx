import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionCard from "@/components/SectionCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import heroImage from "@assets/stock_images/abstract_technology__0bba531a.jpg";
import engineeringImage from "@assets/stock_images/modern_engineering_w_afeecc6f.jpg";
import sportsImage from "@assets/stock_images/professional_cyclist_f2d23366.jpg";
import travelImage from "@assets/stock_images/beautiful_landscape__1091a52c.jpg";

export default function Home() {
  const sections = [
    {
      title: "Ingeniería",
      description: "Proyectos innovadores, código fuente, documentación técnica y soluciones de ingeniería.",
      imageSrc: engineeringImage,
      href: "/ingenieria",
      category: "ingenieria",
    },
    {
      title: "Deportes",
      description: "Noticias y seguimiento de ciclismo de ruta, tenis y Fórmula Uno.",
      imageSrc: sportsImage,
      href: "/deportes",
      category: "deportes",
    },
    {
      title: "Viajes y Fotografía",
      description: "Reseñas de aventuras, destinos increíbles y fotografías del mundo.",
      imageSrc: travelImage,
      href: "/viajes",
      category: "viajes",
    },
  ];

  // TODO: remove mock functionality
  const recentPosts = [
    { id: "eng-1", title: "Sistema de Control IoT con Arduino", category: "Ingeniería", date: "14 Oct 2025" },
    { id: "travel-1", title: "Ascenso al Himalaya: Una Aventura Épica", category: "Viajes", date: "13 Oct 2025" },
    { id: "sports-1", title: "Tour de Francia 2025: Análisis de la Etapa Reina", category: "Deportes", date: "12 Oct 2025" },
    { id: "eng-2", title: "Algoritmo de Optimización en Python", category: "Ingeniería", date: "10 Oct 2025" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        <Hero backgroundImage={heroImage} />
        
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="text-center mb-12 space-y-3">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-sections-title">
                    Explora las Secciones
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-sections-subtitle">
                    Descubre contenido organizado por temas. Haz clic en cualquier sección para ver todas las publicaciones.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sections.map((section) => (
                    <SectionCard key={section.category} {...section} />
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
