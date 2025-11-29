import { useState, useEffect } from "react";
import { type Post } from "@shared/schema"; 
import Header from "@/components/Header";
import SportsTabs from "@/components/SportsTabs";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import MiniCalendar from "@/components/MiniCalendar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard"; // 1. ¡Importamos la Tarjeta Maestra!
import ThemeToggle from "@/components/ThemeToggle";
import { Trophy, Calendar as CalendarIcon } from "lucide-react";

export default function Sports() {
  
  const [sportsPosts, setSportsPosts] = useState<Post[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<any[]>([]);

  // Estados del Calendario
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Posts de Noticias (SOLO DEPORTES)
        const sportsRes = await fetch('http://localhost:5000/api/posts/categoria/deportes', { credentials: 'include' });
        if (sportsRes.ok) setSportsPosts(await sportsRes.json());
        
        // 2. Calendario (Eventos de los 3 deportes)
        const sports = ['ciclismo', 'tenis', 'f1'];
        const eventPromises = sports.map(s => fetch(`http://localhost:5000/api/public/events/${s}`).then(r => r.json()));
        const results = await Promise.all(eventPromises);
        const combinedEvents = [...(results[0] || []), ...(results[1] || []), ...(results[2] || [])];
        setAllEvents(combinedEvents);
        
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchSportsData();
  }, []);

  // 3. PREPARAMOS LOS DATOS (El truco 'viewPosts' para que PostCard funcione perfecto)
  const viewPosts = sportsPosts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  // 4. FILTRAMOS LOS RECIENTES DESDE LOS DATOS DE ESTA CATEGORÍA
  // (Esto hace que la barra lateral sea consistente con la página)
  const recentPostsFiltered = viewPosts.slice(0, 3).map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    date: p.date
  }));

  // Función del Calendario
  const handleDateSelect = (dateString: string) => {
    const newDate = new Date(dateString);
    setCalendarDate(newDate);
    setSelectedDate(newDate);
    const calendarElement = document.getElementById('main-calendar');
    if (calendarElement) {
      calendarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50"> <ThemeToggle /> </div>
      <Header />
      <main className="flex-1">
        
        <div className="bg-gradient-to-b from-muted/30 to-background py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20"> <Trophy className="h-8 w-8 text-primary" /> </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold">Deportes</h1>
                <p className="text-muted-foreground mt-2">Ciclismo, Tenis y Fórmula Uno</p>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              <div className="flex-1 w-full">
                <SportsTabs onDateSelect={handleDateSelect} />

                <div className="mt-12">
                  <h2 className="text-2xl font-heading font-bold mb-6">Últimas Noticias</h2>
                  {isLoading ? ( <p>Cargando...</p> ) : viewPosts.length === 0 ? ( <p>No hay noticias.</p> ) : (
                    <div className="space-y-6">
                      {/* 5. USAMOS EL COMPONENTE LIMPIO */}
                      {/* Esto arregla la imagen recortada, la alineación y los botones */}
                      {viewPosts.map((post) => (
                        <PostCard key={post.id} {...post} className="flex-row md:flex-row" /> 
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-8"> 
                <div id="main-calendar">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" /> Calendario Global
                  </h3>
                  <MiniCalendar 
                    events={allEvents} 
                    currentDate={calendarDate} 
                    onDateChange={setCalendarDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                </div>
                <div>
                    {/* Usamos la lista filtrada */}
                    <RecentPostsSidebar posts={recentPostsFiltered} />
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