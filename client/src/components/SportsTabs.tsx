// Contenido CORREGIDO para client/src/components/SportsTabs.tsx

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, MapPin, ArrowRight } from "lucide-react";

// Tipos
type Ranking = { id: string; rank: number; athleteName: string; points: number; teamName?: string; };
type SportEvent = { id: string; eventName: string; date: string; location?: string; };

// 1. ¡AQUÍ ESTABA EL ERROR! Definimos la interfaz de las Props
interface SportsTabsProps {
  onDateSelect: (date: string) => void;
}

// 2. Recibimos la prop en la función
export default function SportsTabs({ onDateSelect }: SportsTabsProps) {
  
  const [rankings, setRankings] = useState<{ [key: string]: Ranking[] }>({ ciclismo: [], tenis: [], f1: [] });
  const [events, setEvents] = useState<{ [key: string]: SportEvent[] }>({ ciclismo: [], tenis: [], f1: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllSportsData = async () => {
      try {
        const sports = ['ciclismo', 'tenis', 'f1'];
        const rankingPromises = sports.map(s => fetch(`/api/public/rankings/${s}`).then(res => res.json()));
        const eventPromises = sports.map(s => fetch(`/api/public/events/${s}`).then(res => res.json()));
        const rankingsResults = await Promise.all(rankingPromises);
        const eventsResults = await Promise.all(eventPromises);

        setRankings({ ciclismo: rankingsResults[0], tenis: rankingsResults[1], f1: rankingsResults[2] });
        setEvents({ ciclismo: eventsResults[0], tenis: eventsResults[1], f1: eventsResults[2] });
      } catch (error) { console.error(error); } 
      finally { setIsLoading(false); }
    };
    fetchAllSportsData();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;

  // Función para renderizar la lista de eventos
  const renderEventList = (sportEvents: SportEvent[]) => (
    <div className="space-y-3">
      {sportEvents.length === 0 ? <p className="text-sm text-muted-foreground">Sin eventos próximos.</p> :
        sportEvents.map((event) => (
          <div key={event.id} className="flex justify-between items-start p-3 rounded-md bg-muted/50 hover-elevate transition-all">
            <div>
              <p className="font-medium text-sm">{event.eventName}</p>
              {event.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</p>}
            </div>
            <div className="text-right">
              {/* 3. ¡USAMOS LA FUNCIÓN AL HACER CLIC! */}
              {/* Usamos un botón en lugar de <a> para evitar recargas */}
              <button 
                onClick={() => onDateSelect(event.date)}
                className="group flex items-center justify-end w-full"
              >
                <Badge variant="outline" className="text-xs cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {new Date(event.date).toLocaleDateString()}
                  <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );

  const renderRankings = (sportRankings: Ranking[], type: 'pilotos' | 'atletas') => (
     <div className="space-y-2">
        {sportRankings.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-md hover-elevate">
            <div className="flex items-center gap-3">
              <Badge variant={r.rank === 1 ? "default" : "secondary"} className="w-8 h-8 flex items-center justify-center rounded-full">{r.rank}</Badge>
              <div className="flex flex-col">
                <span className="font-medium">{r.athleteName}</span>
                {r.teamName && <span className="text-xs text-muted-foreground">{r.teamName}</span>}
              </div>
            </div>
            <span className="text-muted-foreground text-sm">{r.points} pts</span>
          </div>
        ))}
     </div>
  );

  return (
    <Tabs defaultValue="ciclismo" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ciclismo">Ciclismo</TabsTrigger>
        <TabsTrigger value="tenis">Tenis</TabsTrigger>
        <TabsTrigger value="f1">Fórmula Uno</TabsTrigger>
      </TabsList>

      <TabsContent value="ciclismo" className="mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Calendar className="h-5 w-5" /> Calendario</h3> {renderEventList(events.ciclismo)}</Card>
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Trophy className="h-5 w-5" /> Clasificación UCI</h3> {renderRankings(rankings.ciclismo, 'atletas')}</Card>
        </div>
      </TabsContent>

      <TabsContent value="tenis" className="mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Calendar className="h-5 w-5" /> Torneos</h3> {renderEventList(events.tenis)}</Card>
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Trophy className="h-5 w-5" /> Ranking ATP</h3> {renderRankings(rankings.tenis, 'atletas')}</Card>
        </div>
      </TabsContent>

      <TabsContent value="f1" className="mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Calendar className="h-5 w-5" /> Calendario F1</h3> {renderEventList(events.f1)}</Card>
          <Card className="p-5"><h3 className="text-lg font-semibold mb-4 flex gap-2"><Trophy className="h-5 w-5" /> Clasificación de Pilotos</h3> {renderRankings(rankings.f1, 'pilotos')}</Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}