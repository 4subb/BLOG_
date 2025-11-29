import { sql } from "drizzle-orm";
import { pgTable, text, varchar, pgEnum, timestamp, jsonb, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod"; 

// --- USUARIOS ---
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: userRoleEnum('role').default('user').notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password_hash: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// --- POSTS ---
export const postCategoryEnum = pgEnum('post_category', ['ingenieria', 'deportes', 'viajes']);

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

export const insertPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(postCategoryEnum.enumValues),
  authorId: z.string(),
  imageUrl: z.string().url().optional().nullable(),
  country: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  isPublished: z.boolean().optional(),
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// --- COMENTARIOS ---
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  postId: true,
});
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// --- LIKES (Con restricción única) ---
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.postId),
}));

// --- GUARDADOS (Con restricción única) ---
export const savedPosts = pgTable("saved_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({
  unq: unique().on(t.userId, t.postId),
}));

// --- ENUM DE DEPORTES (Solo para tipos, usamos mockData) ---
export const sportCategoryEnum = pgEnum('sport_category', ['ciclismo', 'tenis', 'f1']);