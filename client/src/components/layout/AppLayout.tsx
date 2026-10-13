import type { ReactNode } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Rutas que se muestran a pantalla completa, sin header ni footer.
const CHROMELESS_ROUTES = ["/login", "/register", "/auth"];

/** Layout persistente: el header/footer no se desmontan al cambiar de ruta, solo <main> anima. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const chromeless = CHROMELESS_ROUTES.includes(location);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Halo superior muy tenue: da profundidad sin competir con el contenido */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--foreground)/0.06),transparent)]"
      />
      {!chromeless && <Header />}
      <main className="relative flex flex-1 flex-col">{children}</main>
      {!chromeless && <Footer />}
    </div>
  );
}
