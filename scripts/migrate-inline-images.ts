// Migración única: saca las imágenes base64 embebidas en posts.content / posts.image_url y en
// users.avatar_url a la tabla `media`. Antes de tocar nada guarda una copia de las filas afectadas en backups/.
//   npx tsx --env-file .env scripts/migrate-inline-images.ts
import { mkdirSync, writeFileSync } from "fs";
import { eq, like, or } from "drizzle-orm";
import { posts, users } from "@shared/schema";
import { db } from "../server/db";
import { storage } from "../server/storage";
import { extractImageUrl, extractInlineImages } from "../server/postContent";

const affected = await db.select().from(posts).where(or(like(posts.content, "%data:image/%"), like(posts.imageUrl, "data:image/%")));
const avatars = await db.select({ id: users.id, avatarUrl: users.avatarUrl }).from(users).where(like(users.avatarUrl, "data:image/%"));
if (affected.length === 0 && avatars.length === 0) {
  console.log("Nada que migrar.");
  process.exit(0);
}

mkdirSync("backups", { recursive: true });
const backupFile = `backups/before-media-${Date.now()}.json`;
writeFileSync(backupFile, JSON.stringify({ posts: affected, avatars }));
console.log(`Copia de seguridad: ${backupFile} (${affected.length} posts, ${avatars.length} avatares)`);

const save = (mimeType: string, base64: string) => storage.createMedia(mimeType, base64);
for (const post of affected) {
  const content = await extractInlineImages(post.content, save);
  const imageUrl = await extractImageUrl(post.imageUrl, save);
  await db.update(posts).set({ content, imageUrl }).where(eq(posts.id, post.id));
  console.log(`${post.id.slice(0, 8)}  ${(post.content.length / 1e6).toFixed(2)} MB → ${(content.length / 1e3).toFixed(1)} KB  ${post.title}`);
}
for (const user of avatars) {
  await db.update(users).set({ avatarUrl: await extractImageUrl(user.avatarUrl, save) }).where(eq(users.id, user.id));
  console.log(`avatar ${user.id.slice(0, 8)}  ${(user.avatarUrl!.length / 1e6).toFixed(2)} MB → /api/media`);
}
process.exit(0);
