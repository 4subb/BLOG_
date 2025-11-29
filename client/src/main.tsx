// Contenido NUEVO para client/src/main.tsx

import React from "react"; // 1. Importamos React (para el StrictMode)
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 2. Importamos nuestro "Proveedor" (el "guardia")
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  // 3. StrictMode es una herramienta de React que te ayuda a encontrar bugs.
  // Es bueno tenerla durante el desarrollo.
  <React.StrictMode>
    {/* 4. ¡LA ENVOLTURA! */}
    {/* Ahora, CUALQUIER componente dentro de <App> puede "preguntar" quién está conectado */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);