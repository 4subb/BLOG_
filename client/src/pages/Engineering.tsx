import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Code2 } from "lucide-react";
import engineeringImage from "@assets/stock_images/modern_engineering_w_afeecc6f.jpg";

export default function Engineering() {
  // TODO: remove mock functionality
  const mockPosts = [
    {
      id: "eng-1",
      title: "Sistema de Control IoT con Arduino",
      excerpt: "Implementación completa de un sistema de monitoreo y control para dispositivos IoT usando Arduino, sensores de temperatura y comunicación WiFi.",
      category: "Ingeniería",
      date: "14 Oct 2025",
      imageUrl: engineeringImage,
      tags: ["IoT", "Arduino", "C++"],
    },
    {
      id: "eng-2",
      title: "Algoritmo de Optimización en Python",
      excerpt: "Desarrollo de un algoritmo de optimización para resolver problemas de rutas usando programación dinámica y técnicas de branch and bound.",
      category: "Ingeniería",
      date: "10 Oct 2025",
      tags: ["Python", "Algoritmos", "Optimización"],
    },
    {
      id: "eng-3",
      title: "Diseño de PCB para Sensor de Calidad del Aire",
      excerpt: "Proceso completo de diseño de una placa de circuito impreso para un sensor de calidad del aire con conectividad Bluetooth.",
      category: "Ingeniería",
      date: "5 Oct 2025",
      imageUrl: engineeringImage,
      tags: ["PCB", "Hardware", "Electrónica"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Code2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-page-title">
                  Ingeniería
                </h1>
                <p className="text-muted-foreground mt-2" data-testid="text-page-subtitle">
                  Proyectos, código y documentación técnica
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
