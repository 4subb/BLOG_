import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; 
import bcrypt from 'bcrypt';         
import { z } from 'zod';            
import { postCategoryEnum, insertCommentSchema, comments, sportCategoryEnum } from '@shared/schema';
import { db } from './db'; 
import { eq } from 'drizzle-orm'; 
import { mockRankings, mockEvents } from './mockData';

type SportCategory = (typeof sportCategoryEnum.enumValues)[number];

// Validaciones
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(postCategoryEnum.enumValues),
  imageUrl: z.string().url().nullable().optional(),
  country: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isPublished: z.boolean().optional(),
});

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.role !== 'admin') return res.status(403).json({ message: "Acceso denegado" });
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
// --- 5. RUTAS DE ADMIN ---
  app.get('/api/posts/admin', isAdmin, async (req, res) => {
    const posts = await storage.getPostsAdmin();
    res.json(posts);
  });
  app.get('/api/posts/:id/admin', isAdmin, async (req, res) => {
    const post = await storage.getPostByIdAdmin(req.params.id);
    if (!post) return res.status(404).json({ message: "No encontrado" });
    res.json(post);
  });
  app.post('/api/posts', isAdmin, async (req, res) => {
    const val = createPostSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    const post = await storage.createPost({ ...val.data, authorId: req.session.userId! });
    res.status(201).json({ message: "Creado", post });
  });
  app.put('/api/posts/:id', isAdmin, async (req, res) => {
    const val = createPostSchema.partial().safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    await storage.updatePost(req.params.id, val.data);
    res.json({ message: "Actualizado" });
  });
  app.delete('/api/posts/:id', isAdmin, async (req, res) => {
    await storage.deletePost(req.params.id);
    res.json({ message: "Borrado" });
  });
  app.delete('/api/comments/:id', isAdmin, async (req, res) => {
    await storage.deleteComment(req.params.id);
    res.json({ message: "Borrado" });
  });
  app.get('/api/users', isAdmin, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });
  app.put('/api/users/:id/role', isAdmin, async (req, res) => {
    if (req.params.id === req.session.userId) return res.status(400).json({ message: "No puedes cambiar tu rol" });
    await storage.updateUserRole(req.params.id, req.body.role);
    res.json({ message: "Rol actualizado" });
  });
  app.delete('/api/users/:id', isAdmin, async (req, res) => {
    if (req.params.id === req.session.userId) return res.status(400).json({ message: "No te puedes borrar" });
    await storage.deleteUser(req.params.id);
    res.json({ message: "Usuario borrado" });
  });


  // --- 1. RUTAS PÚBLICAS DE POSTS ---
  app.get('/api/posts/categoria/:category', async (req, res) => {
    const posts = await storage.getPostsByCategory(req.params.category);
    res.json(posts);
  });
  app.get('/api/posts/:id', async (req, res) => {
    try {
      const result = await storage.getPostById(req.params.id);
      if (!result) return res.status(404).json({ message: "No encontrado" });
      res.json(result); // Devuelve { current, prev, next }
    } catch (e) { res.status(500).json({ message: "Error" }); }
  });

  // --- 2. RUTAS DE INTERACCIÓN ---
  app.get('/api/comments/:postId', async (req, res) => {
    const comments = await storage.getCommentsByPostId(req.params.postId);
    res.json(comments);
  });
  app.get('/api/posts/:id/likes', async (req, res) => {
    try {
      const count = await storage.getPostLikes(req.params.id);
      let userLiked = false;
      if (req.session.userId) userLiked = await storage.hasUserLiked(req.session.userId, req.params.id);
      res.json({ count, userLiked });
    } catch (e) { res.status(500).json({ message: "Error" }); }
  });
  app.get('/api/posts/:id/bookmark', async (req, res) => {
    if (!req.session.userId) return res.json({ isSaved: false });
    const isSaved = await storage.hasUserSavedPost(req.session.userId, req.params.id);
    res.json({ isSaved });
  });

  // --- 3. RUTAS DE DEPORTES (MOCK) ---
  app.get('/api/public/rankings/:sport', (req, res) => {
    const sport = req.params.sport as SportCategory;
    res.json(mockRankings[sport] || []);
  });
  app.get('/api/public/events/:sport', (req, res) => {
    const sport = req.params.sport as SportCategory;
    res.json(mockEvents[sport] || []);
  });

  // --- 4. RUTAS PROTEGIDAS (Login) ---
  app.post('/api/comments', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    const val = insertCommentSchema.omit({ userId: true }).safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    const comment = await storage.createComment({ ...val.data, userId: req.session.userId });
    res.status(201).json(comment);
  });
  app.post('/api/posts/:id/like', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    const isLiked = await storage.toggleLike(req.session.userId, req.params.id);
    const newCount = await storage.getPostLikes(req.params.id);
    res.json({ isLiked, newCount });
  });
  app.post('/api/posts/:id/bookmark', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    const isSaved = await storage.toggleSavedPost(req.session.userId, req.params.id);
    res.json({ isSaved });
  });

  // --- 6. RUTAS DE AUTH ---
  app.post('/api/auth/register', async (req, res) => {
    const val = registerSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    if (await storage.getUserByEmail(val.data.email)) return res.status(409).json({ message: "Email existe" });
    const password_hash = await bcrypt.hash(val.data.password, 10);
    const user = await storage.createUser({ email: val.data.email, password_hash });
    res.status(201).json({ user });
  });
  app.post('/api/auth/login', async (req, res) => {
    const val = loginSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    const user = await storage.getUserByEmail(val.data.email);
    if (!user || !(await bcrypt.compare(val.data.password, user.password_hash))) return res.status(401).json({ message: "Credenciales inválidas" });
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.role = user.role;
    res.json({ message: "Login exitoso", user });
  });
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ message: "Sesión cerrada" }));
  });
  app.get('/api/auth/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ user: null });
    res.json({ user: { id: req.session.userId, email: req.session.email, role: req.session.role } });
  });

// 6. La ruta raíz de posts
  app.get('/api/posts', async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  return createServer(app);
}