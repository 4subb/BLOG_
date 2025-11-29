// Contenido para types/express-session.d.ts

import 'express-session';

// Le decimos a TypeScript que "reabra" el módulo original
declare module 'express-session' {

  // Y "aumente" la interfaz SessionData
  interface SessionData {
  userId?: string;
  email?: string;
  role?: 'admin' | 'user'; // <-- ¡LÍNEA NUEVA!
  }
}