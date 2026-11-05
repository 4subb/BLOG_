// Crea la tabla `media` (shared/schema.ts) si no existe, sin tocar nada más de la base de datos.
// Pensado para producción, donde no conviene lanzar `drizzle-kit push` a ciegas:
//   npx tsx --env-file .env.production scripts/ensure-media-table.ts
import { sql } from "drizzle-orm";
import { db } from "../server/db";

await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "media" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "mime_type" text NOT NULL,
    "data" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )
`);
const { rows } = await db.execute(sql`select count(*)::int as n from media`);
console.log(`Tabla media lista (${(rows[0] as { n: number }).n} imágenes).`);
process.exit(0);
