import type { Express, Router, Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 no captura promesas rechazadas: sin esto, cualquier error de BD en un handler async
// es un unhandledRejection que tumba el proceso de Node. Envolvemos todos los handlers.
export function catchAsyncErrors(target: Pick<Express | Router, 'get' | 'post' | 'put' | 'patch' | 'delete'>) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
    const original = (target as any)[method].bind(target);
    (target as any)[method] = (path: unknown, ...handlers: unknown[]) => {
      // app.get('setting') con un solo argumento es el getter de configuración de Express
      if (method === 'get' && handlers.length === 0) return original(path);
      return original(path, ...handlers.map((h) =>
        typeof h === 'function'
          ? (req: Request, res: Response, next: NextFunction) => {
              try { Promise.resolve((h as RequestHandler)(req, res, next)).catch(next); } catch (err) { next(err); }
            }
          : h,
      ));
    };
  }
}
