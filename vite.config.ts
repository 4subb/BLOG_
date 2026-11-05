import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fecha del último cambio publicado (último commit; si no hay git, la hora del build).
// La muestra "Actualizado" en Inicio, así cualquier cambio desplegado la actualiza solo.
function lastChangeDate() {
  try {
    return new Date(execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim()).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export default defineConfig({
  // Eliminamos los plugins de Replit, solo dejamos React
  plugins: [react()],

  define: {
    __SITE_UPDATED_AT__: JSON.stringify(lastChangeDate()),
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  
  root: path.resolve(__dirname, "client"),
  
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  
  // --- EL PROXY MÁGICO PARA LOCALHOST ---
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Redirige las peticiones /api al backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});