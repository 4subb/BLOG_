// Contenido NUEVO para client/src/main.tsx

import React from "react"; // 1. Importamos React (para el StrictMode)
import './i18n'; // <-- Agrega esta línea
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 2. Importamos nuestro "Proveedor" (el "guardia") y el ThemeProvider
import { AuthProvider } from "./context/AuthContext";
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