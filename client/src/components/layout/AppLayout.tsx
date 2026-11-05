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
      {!chromeless && <Header />}
      <main className="relative flex flex-1 flex-col">{children}</main>
      {!chromeless && <Footer />}
    </div>
  );
}
