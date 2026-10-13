import cors from 'cors';
import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import { registerRoutes } from "./routes"; 
import helmet from "helmet"; 

const app = express();

// 🚨 CORRECCIÓN CLAVE: Confiar en el Proxy de Render
// Esto es OBLIGATORIO para que las cookies funcionen con HTTPS en la nube
app.set("trust proxy", 1); 

// Configuración de seguridad básica
app.use(helmet({
  contentSecurityPolicy: false, 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS: en producción frontend y API comparten origen, así que solo abrimos el dev server de Vite.
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
}

const PgStore = connectPgSimple(session);
const store = new PgStore({
  pool: pool,
  tableName: 'user_sessions',
  createTableIfMissing: true,
});

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in .env file");
}

// Configuración de Sesión
app.use(session({
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true,
    // Secure: true solo si estamos en producción. 
    // Gracias a 'trust proxy', esto ahora funcionará en Render.
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax",
  }
}));

// --- LOGGING (Sin cambios) ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // No volcar al log respuestas con datos de usuario
      if (capturedJsonResponse && !path.startsWith("/api/auth") && !path.startsWith("/api/users")) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// --- INICIO DEL SERVIDOR ---
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (app.get("env") !== "test") {
      console.error(err);
    }
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();