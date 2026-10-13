import { useState, useEffect } from "react";
import { type Post } from "@shared/schema"; 
import SportsTabs from "@/components/SportsTabs";
import RecentPostsSidebar from "@/components/RecentPostsSidebar";
import MiniCalendar from "@/components/MiniCalendar";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import GymTracker from "@/components/GymTracker"; // 🟢 1. IMPORTAMOS EL GYM TRACKER
import { Trophy, Calendar as CalendarIcon, Newspaper } from "lucide-react";

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
        const sportsRes = await fetch('/api/posts/categoria/deportes', { credentials: 'include' });
        if (sportsRes.ok) setSportsPosts(await sportsRes.json());
        
        // 2. Calendario (Eventos de los 3 deportes)
        const sports = ['ciclismo', 'tenis', 'f1'];
        const eventPromises = sports.map(s => fetch(`/api/public/events/${s}`).then(r => r.json()));
        const results = await Promise.all(eventPromises);
        const combinedEvents = [...(results[0] || []), ...(results[1] || []), ...(results[2] || [])];
        setAllEvents(combinedEvents);
        
      } catch (error) { 
        console.error(error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchSportsData();
  }, []);

  // 3. PREPARAMOS LOS DATOS
  const viewPosts = sportsPosts.map(post => ({
    ...post,
    date: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + "...",
    imageUrl: post.imageUrl || undefined,
    country: post.country || undefined,
    tags: post.tags || []
  }));

  // 4. FILTRAMOS LOS RECIENTES
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
    <>
      <PageHeader icon={Trophy} eyebrow="GymTracker · Ciclismo · Tenis · Fórmula 1" title="Deportes" />

      <section className="page-container py-14 sm:py-20">
        <div className="flex flex-col items-start gap-12 lg:flex-row">

          {/* COLUMNA PRINCIPAL */}
          <div className="w-full min-w-0 flex-1 space-y-16">
            <GymTracker />

            <SportsTabs onDateSelect={handleDateSelect} />

            {/* NOTICIAS */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold tracking-[-0.03em]">Últimas noticias</h2>
              {isLoading ? (
                <div className="space-y-5">
                  {[0, 1].map((i) => <PostCardSkeleton key={i} layout="list" />)}
                </div>
              ) : viewPosts.length === 0 ? (
                <EmptyState icon={Newspaper} text="No hay noticias en esta categoría." />
              ) : (
                <Stagger inView className="space-y-5">
                  {viewPosts.map((post) => (
                    <StaggerItem key={post.id}>
                      <PostCard {...post} layout="list" />
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>
          </div>

          {/* COLUMNA LATERAL */}
          <aside className="w-full space-y-10 lg:w-80 lg:shrink-0">
            <div id="main-calendar" className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" /> Calendario global
              </h3>
              <MiniCalendar
                events={allEvents}
                currentDate={calendarDate}
                onDateChange={setCalendarDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            <RecentPostsSidebar posts={recentPostsFiltered} title="Posts recientes" />
          </aside>

        </div>
      </section>
    </>
  );
}
