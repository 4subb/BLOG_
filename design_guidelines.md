# Design Guidelines — "Mission Control"

Inspiración: vastspace.com. Interfaz de bitácora técnica: cálida, tipográfica, precisa. Todas las páginas comparten
**una sola estructura**; cada sección se distingue por su **animación de firma**.

## Paleta (client/src/index.css)
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` | warm white `#fdfcf4` | `#131416` | fondo |
| `--foreground` | meteorite `#2a2c2f` | warm white | texto |
| `--muted` | warm gray `#ece8e3` | — | paneles, hovers |
| `--rock` | moon rock `#b3aba3` | — | reglas de 1px (`border-rock/40–70`, `bg-rock`) |
| `--signal` | solar orange `#ff5623` | — | **único acento**: punto activo, foco, estados vivos |
| `--ghost` | — | — | palabras gigantes de fondo (`text-ghost`) |
Nunca uses colores fijos (`gray-*`, `blue-*`, `white`); usa tokens. El naranja se dosifica: un punto, una línea, un hover.

## Tipografía
- `font-display` — Archivo ancho (wdth 112), peso 500, interlineado 0.86, tracking negativo. Titulares gigantes.
- `label-mono` — Geist Mono 11px en mayúsculas. Telemetría, índices `(01)`, metadatos, fechas `12.10.2026`.
- Cuerpo: Archivo normal, `text-muted-foreground` para secundario.

## Estructura común de página
1. `MissionHero` (`components/mission/MissionHero.tsx`): telemetría `[03] / Ingeniería` + reloj SLP · titular `SplitReveal`
   · descripción + acciones · `SpecSheet` con `Counter` · `GhostWord` con parallax · capa `signature`.
2. Secciones con `SectionHead index="01" title=…` (regla que se dibuja + etiqueta mono).
3. Contenido: `PostCard` (imagen recta que se destapa), `IndexList` (filas grandes con vista previa que sigue al cursor).
4. Vacío: `EmptyMission`. Páginas de herramienta (perfil, panel, editor): `PageIntro`.

## Firmas por sección (`components/mission/signatures.tsx`)
| Página | Firma |
|---|---|
| Inicio | retrato con brackets y tilt 3D · índice con vista previa flotante · biografía que se ilumina con el scroll |
| Ingeniería | `BlueprintSignature`: plano técnico que se dibuja + mira con coordenadas X/Y |
| Deportes | `PulseSignature`: línea de telemetría con tramo naranja en bucle |
| Viajes | `FlightSignature`: ruta de vuelo con avión recorriéndola |
| Lectura | `ScrollReadText` (manifiesto) + cursor parpadeante + renglones |
| Galería | `ViewfinderSignature` (REC + timecode) + imágenes que se destapan con barrido |
| Login/Registro | panel de misión con pulso |

## Movimiento
- Curva `easeOutExpo` (`lib/motion.ts`); revelados con máscara (`clip-path`/`overflow hidden`), nunca rebotes exagerados.
- Barra naranja de 2px barre la parte superior en cada cambio de ruta (`App.tsx`).
- No animes `filter` en wrappers de layout (rompe `sticky`/`fixed`). `MotionConfig reducedMotion="user"` y
  `prefers-reduced-motion` desactivan marquee, parpadeos, scramble y contadores.

## Formas
Esquinas rectas (`rounded-sm` como máximo) en tarjetas e imágenes; botones de acción en píldora (`rounded-full`).
