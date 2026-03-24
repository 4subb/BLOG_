import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; 
import bcrypt from 'bcrypt';        
import { z } from 'zod';            
import { 
  postCategoryEnum, 
  insertPostSchema, 
  insertCommentSchema, 
  sportCategoryEnum, 
  insertGymLogSchema 
} from '@shared/schema'; 

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

const registerSchema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(8),
  username: z.string().min(3).optional()
});

// Validación de deportes
const createRankingSchema = z.object({
  sport: z.enum(sportCategoryEnum.enumValues),
  rankingName: z.string().min(3),
  rank: z.coerce.number().int().positive(),
  athleteName: z.string().min(3),
  teamName: z.string().optional().nullable(),
  points: z.coerce.number().int().optional().nullable(),
});
const createEventSchema = z.object({
  sport: z.enum(sportCategoryEnum.enumValues),
  eventName: z.string().min(3),
  eventDate: z.coerce.date(), 
  location: z.string().optional().nullable(),
});

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.role !== 'admin') return res.status(403).json({ message: "Acceso denegado" });
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // --- Admin Blog ---
  app.get('/api/posts/admin', isAdmin, async (req, res) => { res.json(await storage.getPostsAdmin()); });
  app.get('/api/posts/:id/admin', isAdmin, async (req, res) => { res.json(await storage.getPostByIdAdmin(req.params.id) || { message: "No encontrado" }); });
  
  app.post('/api/posts', isAdmin, async (req, res) => {
    const val = insertPostSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    
    const post = await storage.createPost({ 
      ...val.data, 
      authorId: req.session.userId! 
    });
    res.status(201).json({ message: "Creado", post });
  });

  app.put('/api/posts/:id', isAdmin, async (req, res) => {
    const val = insertPostSchema.partial().safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    await storage.updatePost(req.params.id, val.data);
    res.json({ message: "Actualizado" });
  });
  app.delete('/api/posts/:id', isAdmin, async (req, res) => { await storage.deletePost(req.params.id); res.json({ message: "Borrado" }); });
  app.delete('/api/comments/:id', isAdmin, async (req, res) => { await storage.deleteComment(req.params.id); res.json({ message: "Borrado" }); });
  app.get('/api/users', isAdmin, async (req, res) => { res.json(await storage.getUsers()); });
  app.put('/api/users/:id/role', isAdmin, async (req, res) => {
    if (req.params.id === req.session.userId) return res.status(400).json({ message: "No puedes cambiar tu rol" });
    await storage.updateUserRole(req.params.id, req.body.role);
    res.json({ message: "Rol actualizado" });
  });
  app.delete('/api/users/:id', isAdmin, async (req, res) => {
    if (req.params.id === req.session.userId) return res.status(400).json({ message: "No te puedes borrar" });
    await storage.deleteUser(req.params.id);
    res.json({ message: "Borrado" });
  });

  // --- Perfil Usuario ---
  app.patch('/api/users/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "No autorizado" });
    try {
      const updatedUser = await storage.updateUser(req.session.userId, req.body);
      req.session.email = updatedUser.email;
      res.json(updatedUser);
    } catch { res.status(500).json({ message: "Error" }); }
  });
  app.get('/api/users/me/bookmarks', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "No autorizado" });
    res.json(await storage.getUserBookmarks(req.session.userId));
  });

  // --- Admin Deportes ---
  app.post('/api/admin/rankings', isAdmin, async (req, res) => {
    const val = createRankingSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    res.status(201).json(await storage.createRanking(val.data));
  });
  app.delete('/api/admin/rankings/:id', isAdmin, async (req, res) => { await storage.deleteRanking(req.params.id); res.json({ message: "Borrado" }); });
  app.post('/api/admin/events', isAdmin, async (req, res) => {
    const val = createEventSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    res.status(201).json(await storage.createEvent(val.data));
  });
  app.delete('/api/admin/events/:id', isAdmin, async (req, res) => { await storage.deleteEvent(req.params.id); res.json({ message: "Borrado" }); });

  // --- Gym Tracker (Personal & Protegido) ---
  app.get('/api/gym/me', async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Login requerido" });
      res.json(await storage.getGymLogsByUser(req.session.userId));
    } catch (error) {
      console.error("Error en el GET del Gym:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post('/api/gym', async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Login requerido" });
      const val = insertGymLogSchema.safeParse(req.body);
      if (!val.success) return res.status(400).json(val.error);
      res.status(201).json(await storage.createGymLog(req.session.userId, val.data));
    } catch (error) {
      console.error("Error guardando registro de Gym:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.patch('/api/gym/settings', async (req, res) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Login requerido" });
      const { isGymPublic, gender } = req.body;
      res.json(await storage.updateGymSettings(req.session.userId, isGymPublic, gender));
    } catch (error) {
      res.status(500).json({ message: "Error actualizando configuración" });
    }
  });

  app.get('/api/gym/user/:userId', async (req, res) => {
    try {
      const result = await storage.getPublicGymLogs(req.params.userId);
      if ('message' in result) return res.status(403).json(result);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error buscando el gimnasio del usuario" });
    }
  });

  // Ruta pública para ver el gym de otro usuario (si lo permite)
  app.get('/api/gym/user/:userId', async (req, res) => {
    const result = await storage.getPublicGymLogs(req.params.userId);
    if ('message' in result) return res.status(403).json(result);
    res.json(result);
  });

  // --- Públicas Blog ---
  app.get('/api/posts', async (req, res) => { res.json(await storage.getPosts()); });
  app.get('/api/posts/categoria/:category', async (req, res) => { res.json(await storage.getPostsByCategory(req.params.category)); });
  app.get('/api/posts/:id', async (req, res) => {
    try {
      const result = await storage.getPostById(req.params.id);
      if (!result) return res.status(404).json({ message: "No encontrado" });
      res.json(result);
    } catch { res.status(500).json({ message: "Error" }); }
  });

  // --- Públicas Deportes ---
  app.get('/api/public/rankings/:sport', async (req, res) => {
    try { res.json(await storage.getRankings(req.params.sport)); } catch { res.status(500).json({ message: "Error" }); }
  });
  app.get('/api/public/events/:sport', async (req, res) => {
    try { res.json(await storage.getEvents(req.params.sport)); } catch { res.status(500).json({ message: "Error" }); }
  });

  // --- Interacción ---
  app.get('/api/comments/:postId', async (req, res) => { res.json(await storage.getCommentsByPostId(req.params.postId)); });
  app.get('/api/posts/:id/likes', async (req, res) => {
    const count = await storage.getPostLikes(req.params.id);
    const userLiked = req.session.userId ? await storage.hasUserLiked(req.session.userId, req.params.id) : false;
    res.json({ count, userLiked });
  });
  app.get('/api/posts/:id/bookmark', async (req, res) => {
    const isSaved = req.session.userId ? await storage.hasUserSavedPost(req.session.userId, req.params.id) : false;
    res.json({ isSaved });
  });

  // --- Rutas Protegidas ---
  app.post('/api/comments', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    const val = insertCommentSchema.omit({ userId: true }).safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    res.json(await storage.createComment({ ...val.data, userId: req.session.userId }));
  });
  app.post('/api/posts/:id/like', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    const isLiked = await storage.toggleLike(req.session.userId, req.params.id);
    res.json({ isLiked, newCount: await storage.getPostLikes(req.params.id) });
  });
  app.post('/api/posts/:id/bookmark', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Login requerido" });
    res.json({ isSaved: await storage.toggleSavedPost(req.session.userId, req.params.id) });
  });

  // --- Auth ---
  app.post('/api/auth/register', async (req, res) => {
    const val = registerSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    
    if (await storage.getUserByEmail(val.data.email)) return res.status(409).json({ message: "Existe" });
    
    const password_hash = await bcrypt.hash(val.data.password, 10);
    
    const newUser = await storage.createUser({ 
      email: val.data.email, 
      password_hash,
      username: val.data.username 
    });

    req.session.userId = newUser.id;
    req.session.email = newUser.email;
    req.session.role = newUser.role;

    res.status(201).json({ user: newUser });
  });

  app.post('/api/auth/login', async (req, res) => {
    const val = loginSchema.safeParse(req.body);
    if (!val.success) return res.status(400).json(val.error);
    const user = await storage.getUserByEmail(val.data.email);
    if (!user || !(await bcrypt.compare(val.data.password, user.password_hash))) return res.status(401).json({ message: "Error" });
    req.session.userId = user.id; req.session.email = user.email; req.session.role = user.role;
    res.json({ message: "Login", user });
  });
  app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ message: "Cerrado" })); });
  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ user: null });
    const user = await storage.getUserById(req.session.userId);
    res.json({ user });
  });

  return createServer(app);
}