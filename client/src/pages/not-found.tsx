import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LiveClock, Scramble } from "@/components/mission/primitives";
import { useLang } from "@/lib/lang";

export default function NotFound() {
  const { L } = useLang();
  return (
    <section className="page-container flex flex-1 flex-col justify-between py-10">
      <div className="label-mono flex items-center justify-between text-muted-foreground">
        <span><span className="text-signal">[ERR]</span> / {L("Señal perdida", "Signal lost")}</span>
        <LiveClock className="hidden sm:inline" />
      </div>
      <div className="py-16">
        <p className="font-display text-[clamp(8rem,30vw,26rem)] leading-[0.8]">
          <Scramble text="404" onMount />
        </p>
        <p className="mt-8 max-w-md text-lg text-muted-foreground">{L("Esta ruta no existe o perdió contacto con la base. Vuelve a la órbita principal.", "This route doesn't exist or lost contact with base. Head back to the main orbit.")}</p>
        <Button asChild className="mt-8 h-12 rounded-full px-6">
          <Link href="/">{L("Volver al inicio", "Back to home")}</Link>
        </Button>
      </div>
    </section>
  );
}
