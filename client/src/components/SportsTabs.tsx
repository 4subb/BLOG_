import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, MapPin } from "lucide-react";

export default function SportsTabs() {
  // TODO: remove mock functionality
  const cyclingEvents = [
    { name: "Tour de Francia 2025", date: "1-23 Jul", stage: "Etapa 15", location: "Alpes" },
    { name: "Vuelta a España", date: "23 Ago - 15 Sep", stage: "Próximamente", location: "España" },
  ];

  const tennisEvents = [
    { name: "US Open", date: "26 Ago - 8 Sep", round: "Cuartos de Final", location: "Nueva York" },
    { name: "ATP Finals", date: "10-17 Nov", round: "Próximamente", location: "Turín" },
  ];

  const f1Events = [
    { name: "GP de Japón", date: "20 Oct", session: "Carrera", location: "Suzuka" },
    { name: "GP de Qatar", date: "27 Oct", session: "Próximamente", location: "Losail" },
  ];

  const cyclingRankings = [
    { position: 1, rider: "Tadej Pogačar", points: 2850 },
    { position: 2, rider: "Jonas Vingegaard", points: 2720 },
    { position: 3, rider: "Primož Roglič", points: 2450 },
  ];

  const tennisRankings = [
    { position: 1, player: "Novak Djokovic", points: 9855 },
    { position: 2, player: "Carlos Alcaraz", points: 8805 },
    { position: 3, player: "Daniil Medvedev", points: 7555 },
  ];

  const f1Standings = [
    { position: 1, driver: "Max Verstappen", points: 466 },
    { position: 2, driver: "Lando Norris", points: 331 },
    { position: 3, driver: "Charles Leclerc", points: 307 },
  ];

  return (
    <Tabs defaultValue="ciclismo" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ciclismo" data-testid="tab-ciclismo">Ciclismo</TabsTrigger>
        <TabsTrigger value="tenis" data-testid="tab-tenis">Tenis</TabsTrigger>
        <TabsTrigger value="f1" data-testid="tab-f1">Fórmula Uno</TabsTrigger>
      </TabsList>

      <TabsContent value="ciclismo" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario de Carreras
            </h3>
            <div className="space-y-3">
              {cyclingEvents.map((event, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 rounded-md bg-muted/50 hover-elevate">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.stage}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">{event.date}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Clasificación UCI
            </h3>
            <div className="space-y-2">
              {cyclingRankings.map((rider) => (
                <div key={rider.position} className="flex items-center justify-between p-3 rounded-md hover-elevate">
                  <div className="flex items-center gap-3">
                    <Badge variant={rider.position === 1 ? "default" : "secondary"} className="w-8 h-8 flex items-center justify-center rounded-full">
                      {rider.position}
                    </Badge>
                    <span className="font-medium">{rider.rider}</span>
                  </div>
                  <span className="text-muted-foreground">{rider.points} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="tenis" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Torneos en Curso
            </h3>
            <div className="space-y-3">
              {tennisEvents.map((event, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 rounded-md bg-muted/50 hover-elevate">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.round}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">{event.date}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Ranking ATP
            </h3>
            <div className="space-y-2">
              {tennisRankings.map((player) => (
                <div key={player.position} className="flex items-center justify-between p-3 rounded-md hover-elevate">
                  <div className="flex items-center gap-3">
                    <Badge variant={player.position === 1 ? "default" : "secondary"} className="w-8 h-8 flex items-center justify-center rounded-full">
                      {player.position}
                    </Badge>
                    <span className="font-medium">{player.player}</span>
                  </div>
                  <span className="text-muted-foreground">{player.points} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="f1" className="space-y-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario F1
            </h3>
            <div className="space-y-3">
              {f1Events.map((event, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 rounded-md bg-muted/50 hover-elevate">
                  <div>
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.session}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">{event.date}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Clasificación de Pilotos
            </h3>
            <div className="space-y-2">
              {f1Standings.map((driver) => (
                <div key={driver.position} className="flex items-center justify-between p-3 rounded-md hover-elevate">
                  <div className="flex items-center gap-3">
                    <Badge variant={driver.position === 1 ? "default" : "secondary"} className="w-8 h-8 flex items-center justify-center rounded-full">
                      {driver.position}
                    </Badge>
                    <span className="font-medium">{driver.driver}</span>
                  </div>
                  <span className="text-muted-foreground">{driver.points} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
