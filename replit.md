# Multi-Thematic Blog Platform

## Overview

A multi-thematic blog platform built with React, Express, and PostgreSQL that showcases content across three main categories: Engineering (technical projects and code), Sports (cycling, tennis, and Formula 1), and Travel & Photography. The platform features a futuristic-retro design aesthetic with dark mode as default, content-first principles, and a fully responsive interface built with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for lightweight client-side routing (alternative to React Router)
- Vite as the build tool and development server for fast HMR and optimized builds

**UI Component System**
- shadcn/ui components (Radix UI primitives) for accessible, customizable UI elements
- Tailwind CSS for utility-first styling with custom design tokens
- CVA (Class Variance Authority) for component variant management
- Custom theming system supporting dark/light modes with CSS variables

**State Management**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Hook Form with Zod resolvers for form validation
- Local React state for UI interactions

**Design System**
- Custom futuristic-retro aesthetic blending 80s-90s digital interfaces with modern minimalism
- Typography: Space Grotesk/Rajdhani for headings, Inter/DM Sans for body text
- Color palette: Deep navy-black backgrounds with cyan/purple accents
- Hover effects and transitions for enhanced interactivity

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- Node.js with ES modules (type: "module")
- TypeScript for type safety across the stack

**Database Layer**
- Neon serverless PostgreSQL as the database provider
- Drizzle ORM for type-safe database operations and schema management
- WebSocket support for real-time database connections (via @neondatabase/serverless with ws)

**Data Storage Strategy**
- In-memory storage implementation (MemStorage class) for development
- Interface-based storage design (IStorage) allowing easy swapping between implementations
- Prepared for migration to persistent database storage via Drizzle ORM

**API Design**
- RESTful API structure with `/api` prefix for all endpoints
- JSON request/response format
- Centralized error handling middleware
- Request logging with timing metrics

### Build & Development Tools

**Development Environment**
- Vite development server with HMR for frontend
- tsx for running TypeScript server files directly
- Replit-specific plugins for enhanced development experience (cartographer, dev-banner, runtime-error-modal)

**Build Process**
- Vite bundles frontend assets to `dist/public`
- esbuild bundles server code to `dist` as ESM modules
- TypeScript compilation checking without emit
- Drizzle Kit for database schema migrations

**Path Aliases**
- `@/*` maps to `client/src/*`
- `@shared/*` maps to `shared/*`
- `@assets/*` maps to `attached_assets/*`

### Content Organization

**Three Main Sections**
- Engineering: Technical projects, code documentation, IoT implementations
- Sports: Coverage of cycling, tennis, and Formula 1 with live data and statistics
- Travel & Photography: Country-based travel stories with photo galleries

**Content Features**
- Post detail pages with markdown support
- Country-based filtering for travel content
- Sports tabs for different sports categories
- Recent posts sidebar across all sections
- Comment system with likes and view tracking

## External Dependencies

### Core UI Framework
- **Radix UI**: Comprehensive collection of accessible, unstyled React components (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography

### Database & ORM
- **Neon Serverless PostgreSQL**: Serverless Postgres database (@neondatabase/serverless)
- **Drizzle ORM**: TypeScript ORM for type-safe database operations (drizzle-orm, drizzle-zod)
- **WebSocket (ws)**: Required for Neon serverless connections

### Data Fetching & Forms
- **TanStack Query**: Server state management (@tanstack/react-query)
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation (@hookform/resolvers for integration)

### Development Tools
- **Vite**: Frontend build tool with plugin ecosystem
- **TypeScript**: Type checking across frontend and backend
- **esbuild**: Backend bundling for production
- **Replit Plugins**: Development environment enhancements (@replit/vite-plugin-*)

### Utility Libraries
- **clsx & tailwind-merge**: Conditional class name composition
- **date-fns**: Date formatting and manipulation
- **cmdk**: Command palette component
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express (prepared for authentication)