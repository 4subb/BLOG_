import Header from "@/components/Header";
import PostComments from "@/components/PostComments";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useRoute } from "wouter";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import engineeringImage from "@assets/stock_images/modern_engineering_w_afeecc6f.jpg";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id;

  // TODO: remove mock functionality - fetch real post data
  const mockPost = {
    id: postId || "1",
    title: "Sistema de Control IoT con Arduino",
    content: `
# Introducción

Este proyecto muestra el desarrollo completo de un sistema de control IoT utilizando Arduino y diversos sensores. El objetivo principal es crear un sistema escalable y modular que permita el monitoreo y control remoto de dispositivos.

## Componentes Utilizados

- Arduino Uno R3
- Sensor de temperatura DHT22
- Módulo WiFi ESP8266
- Relés de 5V

## Implementación

El código principal está escrito en C++ y utiliza las bibliotecas estándar de Arduino. A continuación se muestra un fragmento del código principal:

\`\`\`cpp
#include <DHT.h>
#include <ESP8266WiFi.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  WiFi.begin("SSID", "PASSWORD");
}

void loop() {
  float temp = dht.readTemperature();
  Serial.println(temp);
  delay(2000);
}
\`\`\`

## Resultados

El sistema funciona correctamente y permite el monitoreo en tiempo real de la temperatura ambiente. Las pruebas mostraron una precisión del 98% comparado con termómetros calibrados.

## Conclusiones

Este proyecto demuestra la viabilidad de crear sistemas IoT con componentes de bajo costo. Las siguientes mejoras incluirán la integración con plataformas cloud como AWS IoT.
    `,
    category: "Ingeniería",
    date: "14 Oct 2025",
    imageUrl: engineeringImage,
    tags: ["IoT", "Arduino", "C++"],
    views: 1247,
    likes: 89,
  };

  // TODO: remove mock functionality
  const mockComments = [
    { id: "1", author: "María González", content: "Excelente tutorial, muy completo. ¿Qué librería recomiendas para la comunicación WiFi?", date: "Hace 2 horas" },
    { id: "2", author: "Carlos Ruiz", content: "Me sirvió mucho para mi proyecto de tesis. Gracias por compartir!", date: "Hace 1 día" },
  ];

  const recentPosts = [
    { id: "eng-2", title: "Algoritmo de Optimización en Python", category: "Ingeniería", date: "10 Oct 2025" },
    { id: "travel-1", title: "Ascenso al Himalaya: Una Aventura Épica", category: "Viajes", date: "13 Oct 2025" },
    { id: "sports-1", title: "Tour de Francia 2025: Análisis de la Etapa Reina", category: "Deportes", date: "12 Oct 2025" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Header />
      <main className="flex-1">
        <article className="py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <div className="flex-1 max-w-4xl">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </Link>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" data-testid="badge-category">
                        {mockPost.category}
                      </Badge>
                      {mockPost.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-post-title">
                      {mockPost.title}
                    </h1>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span data-testid="text-post-date">{mockPost.date}</span>
                    </div>
                  </div>

                  {mockPost.imageUrl && (
                    <div className="relative overflow-hidden rounded-lg border aspect-video">
                      <img
                        src={mockPost.imageUrl}
                        alt={mockPost.title}
                        className="w-full h-full object-cover"
                        data-testid="img-post-hero"
                      />
                    </div>
                  )}

                  <div className="prose prose-lg dark:prose-invert max-w-none" data-testid="content-post-body">
                    {mockPost.content.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h2 key={idx} className="text-3xl font-heading font-bold mt-8 mb-4">{line.substring(2)}</h2>;
                      } else if (line.startsWith('## ')) {
                        return <h3 key={idx} className="text-2xl font-heading font-semibold mt-6 mb-3">{line.substring(3)}</h3>;
                      } else if (line.startsWith('```')) {
                        return null;
                      } else if (line.trim() === '') {
                        return <div key={idx} className="h-4" />;
                      } else {
                        return <p key={idx} className="text-foreground/90 leading-relaxed mb-4">{line}</p>;
                      }
                    })}
                  </div>

                  <PostComments
                    postId={mockPost.id}
                    views={mockPost.views}
                    likes={mockPost.likes}
                    comments={mockComments}
                  />
                </div>
              </div>

              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-20">
                  <RecentPostsSidebar posts={recentPosts} />
                </div>
              </aside>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
