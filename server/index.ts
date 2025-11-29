import cors from 'cors';
import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import { registerRoutes } from "./routes"; 
import helmet from "helmet"; // 1. ¡NUEVO! Importamos seguridad

const app = express();

// 2. ¡NUEVO! Configuración de seguridad básica
// Helmet configura automáticamente cabeceras HTTP seguras
app.use(helmet({
  contentSecurityPolicy: false, // Desactivamos CSP estricto por ahora para evitar problemas con imágenes externas/scripts de dev
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3. Configuración CORS dinámica
// Esto permite que funcione en localhost Y en tu dominio de producción automáticamente
const allowedOrigins = ['http://localhost:5173']; 
// Nota: Cuando tengas tu dominio (ej. https://miblog.onrender.com), agrégalo a esta lista si fuera necesario,
// pero al servir frontend y backend desde el mismo sitio (como haremos), esto se maneja solo.

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles o curl) o si está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En producción, si el frontend y backend están en el mismo dominio, esto no suele ser problema
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

// 4. Configuración de Cookie segura para Producción
app.use(session({
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // ¡IMPORTANTE! Secure: true solo si estamos en producción (https)
    secure: app.get("env") === "production", 
    // SameSite: lax es bueno para la mayoría de los sitios
    sameSite: "lax",
  }
}));

// --- LOGGING ---
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
    // En producción, no queremos enviar el stack trace del error al usuario
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