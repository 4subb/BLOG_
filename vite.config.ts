import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Eliminamos los plugins de Replit, solo dejamos React
  plugins: [react()],
  
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