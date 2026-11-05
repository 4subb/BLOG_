import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SportsTabs from "@/components/SportsTabs";
import MiniCalendar from "@/components/MiniCalendar";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import GymTracker from "@/components/GymTracker";
import EmptyMission from "@/components/mission/EmptyMission";
import MissionHero from "@/components/mission/MissionHero";
import { SectionHead } from "@/components/mission/primitives";
import { PulseSignature } from "@/components/mission/signatures";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { pad, usePosts } from "@/lib/posts";

export default function Sports() {
  const { t } = useTranslation();
  const { posts, isLoading } = usePosts("deportes");
  const [allEvents, setAllEvents] = useState<any[]>([]);

  // Estados del Calendario
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    // Calendario (eventos de los 3 deportes)
    const sports = ["ciclismo", "tenis", "f1"];
    Promise.all(sports.map((s) => fetch(`/api/public/events/${s}`).then((r) => (r.ok ? r.json() : []))))
      .then((results) => setAllEvents(results.flat()))
      .catch(console.error);
  }, []);

  // Función del Calendario
  const handleDateSelect = (dateString: string) => {
    const newDate = new Date(dateString);
    setCalendarDate(newDate);
    setSelectedDate(newDate);
    document.getElementById("main-calendar")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <MissionHero
        index="04"
        label={t("nav.sports")}
        title={t("pages.sportsTitle")}
        description="GymTracker · Ciclismo · Tenis · Fórmula 1"
        signature={<PulseSignature />}
        loading={isLoading}
        specs={[
          { label: t("ui.disciplines"), value: 4, pad: 2 },
          { label: t("ui.events"), value: allEvents.length, pad: 3 },
          { label: t("ui.entries"), value: posts.length, pad: 3 },
        ]}
        ghost="Telemetry"
      />

      {/* (01) Gym tracker */}
      <section className="page-container py-20 sm:py-28">
        <SectionHead index="01" title="GymTracker" className="mb-10" />
        <GymTracker />
      </section>

      {/* (02) Competiciones + calendario */}
      <section className="page-container pb-20 sm:pb-28">
        <SectionHead index="02" title="Ciclismo · Tenis · F1" aside={`${pad(allEvents.length, 3)} ${t("ui.events")}`} className="mb-10" />
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <SportsTabs onDateSelect={handleDateSelect} />
          </div>
          <aside id="main-calendar" className="lg:col-span-4">
            <p className="label-mono mb-4 text-muted-foreground">Calendario global</p>
            <MiniCalendar
              events={allEvents}
              currentDate={calendarDate}
              onDateChange={setCalendarDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </aside>
        </div>
      </section>

      {/* (03) Noticias */}
      <section className="page-container pb-24 sm:pb-32">
        <SectionHead index="03" title={t("ui.latest")} aside={`${pad(posts.length, 3)} ${t("ui.entries")}`} className="mb-12" />
        {isLoading ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <PostCardSkeleton key={i} />)}</div>
        ) : posts.length === 0 ? (
          <EmptyMission />
        ) : (
          <Stagger inView className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <StaggerItem key={post.id}>
                <PostCard {...post} index={i + 1} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
