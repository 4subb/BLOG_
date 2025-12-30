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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración CORS
// Mantenemos localhost para desarrollo. En producción, al servir todo junto, esto no afecta.
const allowedOrigins = ['http://localhost:5173']; 

app.use(cors({
  origin: (origin, callback) => {
    // Si no hay origen (como apps móviles) o está en la lista blanca (localhost), pasa.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Permitimos el resto porque es una app monolítica (frontend y backend juntos)
      callback(null, true); 
    }
  },
  credentials: true
}));

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
      if (capturedJsonResponse) {
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