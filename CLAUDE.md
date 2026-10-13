# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server (tsx runs `server/index.ts` directly; Vite dev middleware serves the client with HMR). Loads env vars from `.env`.
- `npm run build` — build client via Vite to `dist/public`, then bundle the server with esbuild (ESM) to `dist`.
- `npm start` — run the production build (`NODE_ENV=production node dist/index.js`); serves the static client build instead of Vite middleware.
- `npm run check` — TypeScript type-check (`tsc`, no emit). There is no separate lint command and no test runner configured in this repo.
- `npm run db:push` — push `shared/schema.ts` changes to the database via `drizzle-kit push`. The `user_sessions` table (managed by `connect-pg-simple`) is excluded via `tablesFilter` in `drizzle.config.ts` — never add it to the schema.

There is no test suite. Validate changes with `npm run check` and by running the dev server.

## Architecture

Monolithic full-stack TypeScript app: Express backend + Vite/React frontend, sharing types/schemas through one `shared/` package.

- `client/src/` — React 18 app (Vite root is `client/`). Routing via **Wouter** (`App.tsx`), server state via **TanStack Query**, forms via **React Hook Form + Zod**. UI is shadcn/ui (Radix primitives) + Tailwind, following the minimal "Linear/Vercel" design language described in `.cursorrules` and `design_guidelines.md` (monochrome tokens, hairline borders, Geist type). Header/Footer are rendered once by `components/layout/AppLayout.tsx`; route transitions live in `App.tsx` (`AnimatePresence` keyed by location) and shared motion presets in `client/src/lib/motion.ts`.
- `server/` — Express app. `index.ts` wires up helmet, CORS, JSON body parsing, and `express-session` backed by a Postgres store (`connect-pg-simple`, table `user_sessions`). `routes.ts` registers all `/api/*` endpoints directly on `app` (no router-per-resource split except `spotify.ts`, mounted at `/api/spotify`). `storage.ts` defines the `IStorage` interface and the single `DrizzleStorage` implementation — all DB access goes through the exported `storage` singleton, never through `db` directly in route handlers.
- `shared/schema.ts` — single source of truth for the data model: Drizzle `pgTable` definitions, Zod insert schemas (via `drizzle-zod` and hand-written `z.object`s), and exported `Select`/`Insert` types. Both client and server import from `@shared/*`. When adding a table/column, add it here first, then extend `IStorage`/`DrizzleStorage` in `server/storage.ts`.
- Auth is session-based, not JWT: `req.session.userId` / `req.session.role` (typed via `types/express-session.d.ts`). The `isAdmin` middleware in `routes.ts` checks `req.session.role === 'admin'`. Protected routes read `req.session.userId` directly rather than a dedicated auth middleware for regular users.
- Path aliases (`vite.config.ts` + `tsconfig.json`): `@/*` → `client/src/*`, `@shared/*` → `shared/*`.
- In dev, Vite proxies `/api` to `http://localhost:5000` (see `vite.config.ts`) while the Express server also runs Vite's dev middleware directly via `setupVite` (`server/vite.ts`) — both the standalone `vite` dev server and the Express-embedded one point at the same backend port.

## Content domains

The app is a personal multi-section site, not just a blog: posts (`ingenieria`/`deportes`/`viajes`/`lectura`/`galeria` categories), a sports module (rankings/schedule for `ciclismo`/`tenis`/`f1`), a gym tracker (with a public/private toggle per user), and a travel dashboard (visited places + bucket list by country code). Keep new features consistent with this per-domain table structure in `shared/schema.ts` (one table set per domain, all user-scoped rows reference `users.id`).

## Notes

- `replit.md` describes an earlier Replit-hosted iteration of this project (mentions an `@assets` alias and Replit-specific Vite plugins that are no longer present) — treat it as historical context, not current architecture.
- Required env vars (see `.env`, not committed): `DATABASE_URL`, `SESSION_SECRET`, `VITE_CDN_URL`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`.
