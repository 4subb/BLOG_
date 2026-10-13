import { sql } from "drizzle-orm";
import { pgTable, text, varchar, pgEnum, timestamp, jsonb, boolean, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod"; 

// --- ENUMS ---
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const postCategoryEnum = pgEnum('post_category', ['ingenieria', 'deportes', 'viajes', 'lectura', 'galeria']);
export const sportCategoryEnum = pgEnum('sport_category', ['ciclismo', 'tenis', 'f1']);


// --- TABLAS ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username"), 
  avatarUrl: text("avatar_url"),
  password_hash: text("password_hash").notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  gender: text("gender").default('male').notNull(), // 'male' o 'female'
  isGymPublic: boolean("is_gym_public").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: postCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  authorId: varchar('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url'),
  country: text('country'),
  tags: jsonb('tags').$type<string[]>(),
  isPublished: boolean('is_published').default(true).notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({ unq: unique().on(t.userId, t.postId) }));

export const savedPosts = pgTable("saved_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({ unq: unique().on(t.userId, t.postId) }));

// Tablas de Deportes
export const appRankings = pgTable("app_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sport: sportCategoryEnum('sport').notNull(),
  rankingName: text('ranking_name').notNull(),
  rank: integer('rank').notNull(),
  athleteName: text('athlete_name').notNull(),
  teamName: text('team_name'),
  points: integer('points'),
});

export const appSchedule = pgTable("app_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sport: sportCategoryEnum('sport').notNull(),
  eventName: text('event_name').notNull(),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
});

// --- Tabla del Gym Tracker ---
export const gymLogs = pgTable("gym_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").defaultNow().notNull(),
  exercise: text("exercise").notNull(),
  weight: integer("weight").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  notes: text("notes"),
});

// --- Spotify: conexión persistente por usuario ---
// Los tokens se guardan cifrados (server/crypto.ts). Borrar la fila = desconectar.
export const spotifyTokens = pgTable("spotify_tokens", {
  userId: varchar('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text("refresh_token").notNull(),
  accessToken: text("access_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SpotifyToken = typeof spotifyTokens.$inferSelect;

// --- Tablas de Viajes (Global Travel Dashboard) ---
export const visitedPlaces = pgTable("visited_places", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  countryCode: varchar("country_code", { length: 3 }).notNull(), // Ej. MEX, FRA, USA
  rating: integer("rating").notNull().default(5), // Calificación de 1 a 5
  bestMemory: text("best_memory"),
  worstMemory: text("worst_memory"),
  photos: jsonb('photos').$type<string[]>().default([]), // Arreglo de URLs de fotos
  visitDate: timestamp("visit_date"), // Cuándo fuiste
});

export const bucketList = pgTable("bucket_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  priority: integer("priority").notNull().default(2), // 1: Alta (Urge), 2: Media, 3: Baja
  notes: text("notes"), // "Quiero visitar el museo de Louvre..."
});

// --- Schemas Zod para Viajes ---
export const insertVisitedPlaceSchema = createInsertSchema(visitedPlaces).omit({ id: true, userId: true });
export const insertBucketListSchema = createInsertSchema(bucketList).omit({ id: true, userId: true });

// --- Tipos Exportados para Viajes (Agrega esto al final del archivo) ---
export type VisitedPlace = typeof visitedPlaces.$inferSelect;
export type InsertVisitedPlace = z.infer<typeof insertVisitedPlaceSchema>;
export type BucketList = typeof bucketList.$inferSelect;
export type InsertBucketList = z.infer<typeof insertBucketListSchema>;






//--Schemas Zod
export const insertGymLogSchema = createInsertSchema(gymLogs).omit({ id: true, date: true, userId: true });



// --- SCHEMAS DE VALIDACIÓN (ZOD) ---
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password_hash: true,
  username: true,
  avatarUrl: true,
});

// Este Schema es SOLO para validar lo que manda el frontend (NO incluye authorId)
export const insertPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(postCategoryEnum.enumValues),
  imageUrl: z.string().url().nullable().optional(),
  country: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({ content: true, userId: true, postId: true });


// --- TIPOS EXPORTADOS (SOLUCIÓN DEL ERROR) ---

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
// 🚨 CORRECCIÓN CLAVE: InsertPost ahora usa el tipo de la BASE DE DATOS, no el de Zod.
// Esto permite que 'authorId' sea obligatorio en el backend.
export type InsertPost = typeof posts.$inferInsert; 

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type AppRanking = typeof appRankings.$inferSelect;
export type InsertAppRanking = typeof appRankings.$inferInsert;
export type AppEvent = typeof appSchedule.$inferSelect;
export type InsertAppEvent = typeof appSchedule.$inferInsert;

export type GymLog = typeof gymLogs.$inferSelect;
export type InsertGymLog = z.infer<typeof insertGymLogSchema>;