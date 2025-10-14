import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  backgroundImage: string;
}

export default function Hero({ backgroundImage }: HeroProps) {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="text-hero-title">
          Explorando{" "}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            Innovación
          </span>
          ,{" "}
          <span className="bg-gradient-to-r from-chart-2 via-primary to-chart-2 bg-clip-text text-transparent">
            Deportes
          </span>
          {" "}y{" "}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            Aventuras
          </span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150" data-testid="text-hero-subtitle">
          Un espacio donde la tecnología, el deporte y la fotografía se encuentran para inspirar y compartir experiencias únicas.
        </p>
        <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button 
            size="lg" 
            className="rounded-full backdrop-blur-sm bg-primary/90 hover:bg-primary border border-primary-border"
            data-testid="button-hero-explore"
          >
            Explorar Contenido
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
