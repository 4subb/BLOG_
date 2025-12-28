import { useState, useEffect } from "react";
import { type Post } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import InteractiveHero from "@/components/InteractiveHero";
import SectionCard from "@/components/SectionCard";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import PostCard from "@/components/PostCard";

// --- ELIMINA LAS IMPORTACIONES QUE DABAN ERROR ---
// import heroImage from "@assets/stock_images/..."  <-- BORRAR ESTO
// import engineeringImage from "@assets/stock_images/..." <-- BORRAR ESTO
// ...

// --- USA ESTAS URLs EN SU LUGAR (Imágenes reales y profesionales) ---
const heroImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop";
const engineeringImage = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop";
const sportsImage = "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop";
const travelImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";

export default function Home() {
  const sections = [
    { title: "Ingeniería", description: "Innovación y código.", imageSrc: engineeringImage, href: "/ingenieria", category: "ingenieria" },
    { title: "Deportes", description: "F1, Tenis y Ciclismo.", imageSrc: sportsImage, href: "/deportes", category: "deportes" },
    { title: "Viajes", description: "Aventuras por el mundo.", imageSrc: travelImage, href: "/viajes", category: "viajes" },
  ];

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts', { credentials: 'include' });
        if (!response.ok) throw new Error('Error');
        setPosts(await response.json());
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    };
    fetchAllPosts();
  }, []);

  const viewPosts = posts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  const recentPosts = viewPosts.slice(0, 4);

  // Configuración de animación para las listas
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Efecto cascada: uno tras otro
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Empieza abajo y transparente
    show: { opacity: 1, y: 0 }     // Sube a su lugar
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-4 right-4 z-50"> <ThemeToggle /> </div>
      <Header />
      
      <main className="flex-1">
        {/* 1. NUEVO HÉROE INTERACTIVO */}
        <InteractiveHero backgroundImage={heroImage} />
        
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-12 flex-col lg:flex-row">
              
              <div className="flex-1">
                
                {/* Secciones Animadas */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }} // Se activa cuando haces scroll
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12 space-y-3"
                >
                  <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-sections-title">
                    Explora las Secciones
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Descubre contenido organizado por temas.
                  </p>
                </motion.div>
                
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                  {sections.map((section) => (
                    <motion.div key={section.category} variants={itemVariants}>
                      <SectionCard {...section} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Últimas Publicaciones Animadas */}
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl font-heading font-bold mb-6"
                >
                  Últimas Publicaciones
                </motion.h2>

                <div className="space-y-8">
                  {isLoading ? ( <p>Cargando...</p> ) : viewPosts.length === 0 ? ( <p>Vacío...</p> ) : (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      className="space-y-6"
                    >
                      {viewPosts.map((post) => (
                        <motion.div key={post.id} variants={itemVariants}>
                           <PostCard {...post} className="flex-row md:flex-row" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Barra Lateral (Animada al entrar) */}
              <aside className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="sticky top-20">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <RecentPostsSidebar posts={recentPosts} />
                  </motion.div>
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