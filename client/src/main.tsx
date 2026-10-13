// Contenido NUEVO para client/src/main.tsx

// Importante: usar el alias "@/" y no rutas relativas. En dev, server/vite.ts carga main.tsx con
// "?v=<id>" y Vite propaga ese query a los imports relativos: "./context/AuthContext" acabaría
// siendo un módulo distinto de "@/context/AuthContext" (dos contextos → useAuth sin provider).
import React from "react"; // 1. Importamos React (para el StrictMode)
import '@/i18n'; // <-- Agrega esta línea
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

// 2. Importamos nuestro "Proveedor" (el "guardia") y el ThemeProvider
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  // 3. StrictMode es una herramienta de React que te ayuda a encontrar bugs.
  // Es bueno tenerla durante el desarrollo.
  <React.StrictMode>
    {/* 4. ¡LA ENVOLTURA! */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);