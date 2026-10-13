import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-28">
      <Stagger className="text-center">
        <StaggerItem>
          <p className="font-mono text-sm text-muted-foreground">404</p>
        </StaggerItem>
        <StaggerItem>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Página no encontrada</h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">La ruta que buscas no existe o fue movida.</p>
        </StaggerItem>
        <StaggerItem className="mt-8">
          <Button asChild className="rounded-full px-6">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
