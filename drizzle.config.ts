// Contenido NUEVO y RECOMENDADO para drizzle.config.ts

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  
  // ¡AQUÍ ESTÁ LA LÍNEA NUEVA!
  // Le dice a Drizzle-Kit: "Ignora la tabla 'user_sessions' para siempre"
  tablesFilter: ["!user_sessions"], 
});