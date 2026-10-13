# Design Guidelines — Minimal Premium

Inspiración: Linear, Vercel. El contenido manda; la interfaz se retira y solo "vive" en las transiciones y micro-interacciones.

## Principios
1. **Contenido primero** — sin decoración que compita con el texto o las imágenes.
2. **Espacio generoso** — secciones con `py-20 sm:py-28`, cabeceras con `pt-16 sm:pt-24`.
3. **Bordes de 1px** — `border-border/60–70`; las sombras son casi planas y solo crecen al hover.
4. **Monocromo** — negro/blanco + escala de grises. El azul (`--ring`) es solo para el foco.
5. **Movimiento con intención** — rápido al arrancar, frenado largo (`out-expo`); muelles cortos en hover/tap.

## Tokens (client/src/index.css)
| Token | Claro | Oscuro |
|---|---|---|
| `--background` | `0 0% 99%` | `0 0% 4%` |
| `--card` | `0 0% 100%` | `0 0% 6%` |
| `--border` | `240 6% 90%` | `0 0% 14%` |
| `--primary` | `240 6% 10%` | `0 0% 98%` |
| `--muted-foreground` | `240 4% 46%` | `0 0% 62%` |
| `--ring` | `217 91% 60%` | `217 91% 60%` |

Usa siempre las clases de tokens (`bg-card`, `text-muted-foreground`…). Nunca `gray-*`, `bg-white` ni `text-black` (rompen el modo oscuro). Excepción: el editor Quill, que necesita fondo blanco.

## Tipografía
- **Geist** para todo el texto; **Geist Mono** para eyebrows, categorías y metadatos (`font-mono text-xs uppercase tracking-[0.12em]`).
- Titulares: `font-semibold`, tracking negativo (`-0.03em` en h2, `-0.04em` en h1), `leading` ajustado.
- Párrafos: `text-muted-foreground leading-relaxed`, ancho máximo ~`max-w-2xl`.

## Layout
- `AppLayout` renderiza Header + `<main>` + Footer una sola vez. Las páginas **no** importan Header/Footer.
- `/login`, `/register`, `/auth` se muestran sin chrome, usando `AuthShell`.
- `.page-container` = `max-w-6xl` + gutters. Lectura (PostDetail): `max-w-3xl`.
- Cabeceras de sección: `PageHeader` (icono + eyebrow + título + descripción sobre `bg-grid`).
- Estados vacíos: `EmptyState`. Cargas: skeletons (`PostCardSkeleton`), nunca un "Cargando…" en texto suelto.

## Navegación
- Header sticky, transparente arriba; al hacer scroll gana `bg-background/75 backdrop-blur-xl` y un borde inferior.
- La ruta activa se marca con una píldora `layoutId="nav-pill"` que sigue al cursor.
- El menú de usuario va en un `DropdownMenu` (Radix).

## Movimiento (client/src/lib/motion.ts)
| Preset | Uso |
|---|---|
| `pageVariants` | Cambio de ruta (`App.tsx`, `AnimatePresence mode="wait"`). Solo opacidad + Y. |
| `Stagger` / `StaggerItem` | Revelado en cascada de rejillas y listas (`inView` para contenido bajo el pliegue). |
| `hoverLift` | Tarjetas clicables: elevación -4px con muelle + `scale(0.985)` al pulsar. |
| `springSnappy` / `springSoft` | Micro-interacciones / elementos que se desplazan. |

Reglas:
- No animes `filter` en wrappers de layout: crea un containing block y rompe `sticky`/`fixed` (AcademicProfile depende de ello).
- Los botones no escalan al hover; solo `active:scale-[0.97]`.
- Imágenes de tarjeta: `group-hover:scale-[1.04]` con `duration-700 ease-out-expo`.
- `MotionConfig reducedMotion="user"` respeta la preferencia del sistema.
