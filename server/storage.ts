import { 
  type User, type InsertUser, users,
  type InsertPost, posts, type Post, postCategoryEnum,
  comments, type Comment, type InsertComment,
  postLikes, savedPosts
} from "@shared/schema";
import { db } from "./db"; 
import { eq, sql, desc, and, ne, lt, gt, asc } from "drizzle-orm"; 

export interface IStorage {
  // Usuarios
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<{ id: string; email: string; role: "admin" | "user"; }[]>;
  deleteUser(userId: string): Promise<boolean>;
  updateUserRole(userId: string, role: 'admin' | 'user'): Promise<User | undefined>;
  
  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostsByCategory(category: string): Promise<Post[]>;
  // Esta devuelve el objeto de navegación
  getPostById(id: string): Promise<{ current: Post; prev?: Post; next?: Post } | undefined>;
  getPostByIdAdmin(id: string): Promise<Post | undefined>;
  updatePost(postId: string, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(postId: string): Promise<boolean>;
  getPostsAdmin(): Promise<Post[]>;

  // Comentarios
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: string): Promise<(Comment & { author: string })[]>;
  deleteComment(commentId: string): Promise<boolean>;

  // Likes y Guardados
  toggleLike(userId: string, postId: string): Promise<boolean>;
  getPostLikes(postId: string): Promise<number>;
  hasUserLiked(userId: string, postId: string): Promise<boolean>;
  
  toggleSavedPost(userId: string, postId: string): Promise<boolean>;
  hasUserSavedPost(userId: string, postId: string): Promise<boolean>;
}

export class DrizzleStorage implements IStorage {
  
  // --- Usuarios ---
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning(); 
    return result[0];
  }
  async getUsers(): Promise<{ id: string; email: string; role: "admin" | "user"; }[]> {
    const result = await db.select({ id: users.id, email: users.email, role: users.role }).from(users).orderBy(users.email);
    return result;
  }
  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId)).returning();
    return result.length > 0;
  }
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<User | undefined> {
    const result = await db.update(users).set({ role: role }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  // --- Posts ---
  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }
  async getPosts(): Promise<Post[]> {
    const result = await db.select().from(posts).where(eq(posts.isPublished, true)).orderBy(sql`created_at DESC`);
    return result as Post[];
  }
  async getPostsByCategory(category: string): Promise<Post[]> {
    if (!postCategoryEnum.enumValues.includes(category as any)) return [];
    const result = await db.select().from(posts).where(and(eq(posts.category, category as any), eq(posts.isPublished, true))).orderBy(sql`created_at DESC`);
    return result as Post[]; 
  }
  
  // Función de Navegación (Anterior/Siguiente)
  async getPostById(id: string): Promise<{ current: Post; prev?: Post; next?: Post } | undefined> {
    const currentResult = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.isPublished, true))).limit(1);
    const current = currentResult[0];
    if (!current) return undefined;

    const prevResult = await db.select().from(posts)
      .where(and(eq(posts.isPublished, true), eq(posts.category, current.category), ne(posts.id, current.id), lt(posts.createdAt, current.createdAt)))
      .orderBy(desc(posts.createdAt)).limit(1);

    const nextResult = await db.select().from(posts)
      .where(and(eq(posts.isPublished, true), eq(posts.category, current.category), ne(posts.id, current.id), gt(posts.createdAt, current.createdAt)))
      .orderBy(asc(posts.createdAt)).limit(1);

    return { current, prev: prevResult[0], next: nextResult[0] };
  }

  async getPostByIdAdmin(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0] as Post;
  }
  async updatePost(postId: string, data: Partial<InsertPost>): Promise<Post | undefined> {
    const result = await db.update(posts).set(data).where(eq(posts.id, postId)).returning();
    return result[0];
  }
  async deletePost(postId: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, postId)).returning();
    return result.length > 0;
  }
  async getPostsAdmin(): Promise<Post[]> {
    const result = await db.select().from(posts).orderBy(sql`created_at DESC`);
    return result as Post[];
  }

  // --- Comentarios ---
  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }
  async getCommentsByPostId(postId: string): Promise<(Comment & { author: string })[]> {
    const result = await db.select({
      id: comments.id, content: comments.content, createdAt: comments.createdAt,
      userId: comments.userId, postId: comments.postId, author: users.email
    }).from(comments).innerJoin(users, eq(comments.userId, users.id)).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
    return result;
  }
  async deleteComment(commentId: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, commentId)).returning();
    return result.length > 0;
  }

  // --- Likes & Guardados ---
  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const existing = await db.select().from(postLikes).where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))).limit(1);
    if (existing.length > 0) {
      await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
      return false; 
    } else {
      try { await db.insert(postLikes).values({ userId, postId }); return true; } catch { return true; }
    }
  }
  async getPostLikes(postId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(postLikes).where(eq(postLikes.postId, postId));
    return Number(result[0]?.count || 0);
  }
  async hasUserLiked(userId: string, postId: string): Promise<boolean> {
    const result = await db.select().from(postLikes).where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))).limit(1);
    return result.length > 0;
  }
  async toggleSavedPost(userId: string, postId: string): Promise<boolean> {
    const existing = await db.select().from(savedPosts).where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId))).limit(1);
    if (existing.length > 0) {
      await db.delete(savedPosts).where(eq(savedPosts.id, existing[0].id));
      return false;
    } else {
      try { await db.insert(savedPosts).values({ userId, postId }); return true; } catch { return true; }
    }
  }
  async hasUserSavedPost(userId: string, postId: string): Promise<boolean> {
    const result = await db.select().from(savedPosts).where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId))).limit(1);
    return result.length > 0;
  }
}
export const storage = new DrizzleStorage();