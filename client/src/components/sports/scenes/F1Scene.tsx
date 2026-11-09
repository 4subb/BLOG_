import { useMemo } from "react";
import { REDUCED_CSS, SceneFrame, W, H, rng, smoothPath, type Pt } from "./shared";

/*
 * F1 · Suzuka: el trazado en "ocho" (con su cruce elevado) como protagonista, inclinado en
 * perspectiva sobre la llanura; el monte Fuji al fondo, la noria del parque, cerezos en flor a los
 * lados soltando pétalos, y en primer plano la recta donde pasan los monoplazas con los colores de
 * cada equipo (solo esquemas de color, sin logotipos).
 */

/* ───────────── Libreas (esquemas de color 2026, sin marcas) ───────────── */
type Livery = { team: string; body: string; side: string; accent: string; nose: string; wing: string; helmet: string; tyre: string };

const LIVERIES: Record<string, Livery> = {
  mclaren:  { team: "McLaren",       body: "#ff8000", side: "#1b1d22", accent: "#ff8000", nose: "#ff8000", wing: "#1b1d22", helmet: "#ffd400", tyre: "#e10600" },
  redbull:  { team: "Red Bull",      body: "#1e2a5a", side: "#16204a", accent: "#e30b2e", nose: "#ffc906", wing: "#1e2a5a", helmet: "#f2f2f2", tyre: "#ffd200" },
  haas:     { team: "Haas",          body: "#f4f4f4", side: "#1b1d22", accent: "#e6002d", nose: "#f4f4f4", wing: "#1b1d22", helmet: "#e6002d", tyre: "#f5f5f5" },
  mercedes: { team: "Mercedes",      body: "#c9ced3", side: "#121417", accent: "#00d7b6", nose: "#c9ced3", wing: "#121417", helmet: "#121417", tyre: "#e10600" },
  ferrari:  { team: "Ferrari",       body: "#dc0000", side: "#1a1a1a", accent: "#f4f4f4", nose: "#dc0000", wing: "#dc0000", helmet: "#ffd400", tyre: "#ffd200" },
  aston:    { team: "Aston Martin",  body: "#00594f", side: "#043b35", accent: "#cedc00", nose: "#00594f", wing: "#043b35", helmet: "#cedc00", tyre: "#f5f5f5" },
  williams: { team: "Williams",      body: "#1868db", side: "#0b1f4a", accent: "#7fd3ff", nose: "#1868db", wing: "#0b1f4a", helmet: "#f4f4f4", tyre: "#e10600" },
  alpine:   { team: "Alpine",        body: "#0a2c6b", side: "#061a40", accent: "#ff87bc", nose: "#ff87bc", wing: "#0a2c6b", helmet: "#ff87bc", tyre: "#ffd200" },
};

/** Paso por la recta: equipo, retraso en el ciclo, carril (0 = cerca, 1 = lejos). */
const PASSES: { car: keyof typeof LIVERIES; at: number; lane: 0 | 1 }[] = [
  { car: "mclaren", at: 0, lane: 0 },
  { car: "redbull", at: 2.8, lane: 0 },
  { car: "mercedes", at: 5.6, lane: 1 },
  { car: "haas", at: 5.75, lane: 0 },
  { car: "ferrari", at: 8.8, lane: 0 },
  { car: "aston", at: 11.3, lane: 0 },
  { car: "alpine", at: 13.6, lane: 1 },
  { car: "williams", at: 13.8, lane: 0 },
];
const CYCLE = 16;

/** Monoplaza 2026 de perfil, mirando a la derecha, en un lienzo de 320×90 (suelo en y=86). */
export function F1Car({ l }: { l: Livery }) {
  return (
    <svg viewBox="0 0 320 90" className="block h-auto w-full overflow-visible" aria-hidden>
      <ellipse cx="166" cy="86" rx="150" ry="4" fill="#000" opacity="0.28" />
      {/* alerón trasero: placa lateral, plano principal, flap y viga */}
      <path d="M8 12 H48 L46 20 H10 Z" fill={l.wing} />
      <path d="M10 22 H44 L42 27 H12 Z" fill={l.body} />
      <rect x="6" y="10" width="7" height="50" rx="1.5" fill={l.side} />
      <rect x="6" y="10" width="7" height="6" fill={l.accent} />
      <path d="M30 27 L34 62 H44 L40 27 Z" fill="#14161a" />
      {/* fondo plano */}
      <path d="M30 76 H292 L298 81 H26 Z" fill="#101114" />
      {/* carrocería */}
      <path d="M40 72 V56 C58 50 92 45 122 41 L148 36 C154 27 162 21 172 20 L180 22 L188 38 L210 42 C238 47 268 54 296 60 L302 67 L260 72 Z" fill={l.body} />
      {/* pontón y zona baja */}
      <path d="M92 72 C96 58 118 51 150 50 L204 52 C212 56 218 64 220 72 Z" fill={l.side} />
      <path d="M136 52 C146 47 166 46 176 50 L176 56 L136 58 Z" fill="#0b0c0e" opacity="0.85" />
      {/* aleta del motor */}
      <path d="M60 52 L150 36 L154 40 L64 55 Z" fill={l.side} opacity="0.55" />
      {/* franja del equipo */}
      <path d="M66 62 C120 55 210 54 300 63" fill="none" stroke={l.accent} strokeWidth="3.4" strokeLinecap="round" />
      {/* morro */}
      <path d="M232 52 C256 56 280 59 302 63 L303 68 L236 66 Z" fill={l.nose} />
      {/* toma de aire + roll hoop */}
      <path d="M160 24 C164 18 174 16 180 22 L176 30 L162 30 Z" fill="#0b0c0e" />
      {/* casco + halo */}
      <circle cx="194" cy="34" r="8.5" fill={l.helmet} />
      <path d="M190 31 h11 a3 3 0 0 1 0 5 h-11 z" fill="#0b0c0e" />
      <path d="M176 32 C182 21 204 21 214 38" fill="none" stroke="#0b0c0e" strokeWidth="4" strokeLinecap="round" />
      <path d="M201 25 L203 40" stroke="#0b0c0e" strokeWidth="3" />
      {/* espejo */}
      <path d="M214 40 h8 v4 h-8 z" fill={l.side} />
      {/* alerón delantero (dos planos + placa) */}
      <path d="M256 72 H318 L318 77 H250 Z" fill={l.wing} />
      <path d="M262 78 H318 L318 82 H258 Z" fill={l.body} />
      <rect x="312" y="62" width="6" height="21" rx="1.5" fill={l.accent} />
      {/* ruedas */}
      <Wheel cx={64} cy={64} r={22} tyre={l.tyre} />
      <Wheel cx={262} cy={66} r={20} tyre={l.tyre} />
    </svg>
  );
}

function Wheel({ cx, cy, r, tyre }: { cx: number; cy: number; r: number; tyre: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#16171a" />
      <circle r={r * 0.78} fill="none" stroke={tyre} strokeWidth="1.6" />
      <circle r={r * 0.6} fill="#2b2e33" />
      <g className="f1-spin">
        <path d={`M${-r * 0.55} 0 H${r * 0.55} M0 ${-r * 0.55} V${r * 0.55}`} stroke="#5a5f66" strokeWidth="2.2" />
        <circle r={r * 0.6} fill="none" stroke="#5a5f66" strokeWidth="1" strokeDasharray="3 4" />
      </g>
      <circle r={r * 0.18} fill="#d0d3d8" />
    </g>
  );
}

/* ───────────── Trazado de Suzuka (aprox. a escala, lienzo 640×300) ───────────── */
// Orden de carrera: recta → 1-2 → eses → Dunlop → Degner → (bajo el puente) → horquilla →
// Spoon → contrarrecta → (sobre el puente) → 130R → chicane Casio → recta.
const SUZUKA: Pt[] = [
  [470, 236], [536, 238], [584, 234], [608, 210], [602, 184], [576, 168],
  [552, 160], [530, 142], [506, 156], [482, 136], [458, 150], [432, 126],
  [414, 104], [392, 98], [372, 110], [340, 132], [300, 160], [264, 186],
  [234, 208], [210, 220], [194, 210], [198, 194], [170, 176], [130, 152],
  [94, 134], [68, 110], [72, 84], [102, 70], [154, 74], [212, 92],
  [258, 120], [300, 160], [334, 194], [362, 212], [392, 220], [404, 210],
  [420, 222], [442, 232],
];
const SUZUKA_D = smoothPath(SUZUKA, true, 0.55);
// Tramo de la contrarrecta que pasa por encima del puente
const BRIDGE_D = smoothPath([[236, 104], [258, 120], [280, 139], [300, 160], [318, 177], [334, 194]], false, 0.5);
const CORNERS: [string, number, number][] = [
  ["1-2", 622, 200], ["S", 506, 128], ["DUNLOP", 400, 140], ["DEGNER", 404, 84],
  ["HAIRPIN", 196, 244], ["SPOON", 34, 96], ["130R", 352, 236], ["CASIO", 404, 196],
];
const TRACK_CARS = ["#ff8000", "#1e2a5a", "#c9ced3", "#dc0000", "#f4f4f4", "#00594f", "#1868db", "#ff87bc"];

function SuzukaTrack() {
  const crowd = useMemo(() => {
    const r = rng(7);
    const colors = ["#e63946", "#f1faee", "#1d3557", "#ffb703", "#ff8000", "#2a9d8f"];
    return Array.from({ length: 140 }, (_, i) => ({ x: 476 + (i % 70) * 1.7, y: 252 + Math.floor(i / 70) * 4 + r() * 1.5, c: colors[Math.floor(r() * colors.length)] }));
  }, []);
  return (
    <svg viewBox="0 0 640 300" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="f1-run" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9fc77a" /><stop offset="1" stopColor="#86b864" />
        </linearGradient>
      </defs>
      {/* zona del circuito (hierba más cuidada) */}
      <path d={SUZUKA_D} fill="none" stroke="url(#f1-run)" strokeWidth="46" strokeLinejoin="round" opacity="0.9" />
      {/* grava en las curvas rápidas */}
      {[[604, 196], [416, 100], [72, 98], [348, 206]].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="17" fill="#e7d9b5" opacity="0.9" />
      ))}
      {/* tribuna principal */}
      <rect x="472" y="248" width="124" height="12" rx="1.5" fill="#d8dadf" />
      {crowd.map((p, i) => <rect key={i} x={p.x} y={p.y} width="1.3" height="1.6" fill={p.c} />)}
      {/* pit lane */}
      <path d="M440 244 C470 245 540 246 590 242" fill="none" stroke="#8b8f96" strokeWidth="3" />
      {/* pista: borde blanco + asfalto */}
      <path d={SUZUKA_D} fill="none" stroke="#f5f5f2" strokeWidth="17" strokeLinejoin="round" />
      <path d={SUZUKA_D} fill="none" stroke="#e10600" strokeWidth="17" strokeDasharray="5 5" strokeLinejoin="round" opacity="0.45" />
      <path d={SUZUKA_D} fill="none" stroke="#43464c" strokeWidth="13" strokeLinejoin="round" />
      <path d={SUZUKA_D} fill="none" stroke="#ffffff" strokeWidth="0.6" strokeDasharray="6 10" opacity="0.5" />
      {/* puente del cruce: sombra + tramo superior redibujado encima */}
      <path d={BRIDGE_D} fill="none" stroke="#000" strokeWidth="22" opacity="0.25" transform="translate(3 4)" />
      <path d={BRIDGE_D} fill="none" stroke="#f5f5f2" strokeWidth="18" />
      <path d={BRIDGE_D} fill="none" stroke="#43464c" strokeWidth="13" />
      {/* meta a cuadros */}
      <g transform="translate(500 236.6) rotate(92)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x={-6.5 + i * 2.2} y="-2" width="2.2" height="2" fill={i % 2 ? "#111" : "#fff"} />
            <rect x={-6.5 + i * 2.2} y="0" width="2.2" height="2" fill={i % 2 ? "#fff" : "#111"} />
          </g>
        ))}
      </g>
      {/* nombres de las curvas */}
      {CORNERS.map(([n, x, y]) => (
        <text key={n} x={x} y={y} fontSize="11" fontFamily="'Geist Mono', monospace" fontWeight="600" fill="#ffffff" stroke="#1f2a1a" strokeWidth="2.6" paintOrder="stroke" textAnchor="middle" letterSpacing="1">{n}</text>
      ))}
      {/* monoplazas en miniatura recorriendo el trazado */}
      {TRACK_CARS.map((c, i) => (
        <g key={c}>
          <rect x="-6" y="-2.6" width="12" height="5.2" rx="2" fill={c} stroke="#111" strokeWidth="0.8">
            <animateMotion dur="22s" begin={`${-i * 2.4}s`} repeatCount="indefinite" path={SUZUKA_D} rotate="auto" />
          </rect>
        </g>
      ))}
    </svg>
  );
}

/* ───────────── Fondo: cielo, Fuji, noria, colinas, llanura ───────────── */
function Backdrop() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="f1-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7fa9d6" /><stop offset="0.55" stopColor="#c9d9ea" /><stop offset="1" stopColor="#f7dccb" />
        </linearGradient>
        <linearGradient id="f1-fuji" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4d6b96" /><stop offset="0.7" stopColor="#7f98bb" /><stop offset="1" stopColor="#b9c6da" />
        </linearGradient>
        <linearGradient id="f1-field" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8ab868" /><stop offset="1" stopColor="#5d9440" />
        </linearGradient>
        <radialGradient id="f1-sun"><stop offset="0" stopColor="#fff6e0" /><stop offset="1" stopColor="#fff6e0" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#f1-sky)" />
      <circle cx="880" cy="96" r="120" fill="url(#f1-sun)" opacity="0.8" />
      {/* nubes */}
      <g className="f1-clouds" fill="#fff" opacity="0.75">
        <ellipse cx="330" cy="70" rx="70" ry="13" /><ellipse cx="370" cy="62" rx="40" ry="13" />
        <ellipse cx="820" cy="44" rx="80" ry="12" /><ellipse cx="780" cy="38" rx="36" ry="11" />
      </g>
      <g transform="translate(0 -40)">
      {/* monte Fuji */}
      <path d="M250 214 C380 190 470 120 578 54 L590 50 L612 52 L624 56 C730 120 820 190 950 214 Z" fill="url(#f1-fuji)" />
      <path d="M538 82 L578 54 L590 50 L612 52 L624 56 L666 84 L652 92 L640 84 L628 98 L614 86 L602 102 L590 88 L576 100 L566 88 L552 96 Z" fill="#f4f7fb" />
      <path d="M600 52 L612 52 L624 56 L666 84 L652 92 L640 84 L628 98 L614 86 Z" fill="#d8e1ec" opacity="0.8" />
      {/* bruma */}
      <rect y="176" width={W} height="40" fill="#fff" opacity="0.28" />
      {/* colinas lejanas */}
      <path d="M0 214 C120 190 220 204 320 198 C430 192 520 210 640 204 C760 198 860 186 980 196 C1080 204 1150 196 1200 192 V230 H0 Z" fill="#7f9f8a" opacity="0.8" />
      {/* noria del parque de Suzuka */}
      <g transform="translate(905 120) scale(0.8)">
        <path d="M-22 64 L0 0 L22 64" stroke="#e8eef4" strokeWidth="3" fill="none" />
        <g className="f1-ferris">
          <circle r="48" fill="none" stroke="#e8eef4" strokeWidth="2.5" />
          <circle r="40" fill="none" stroke="#e8eef4" strokeWidth="1" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const x = Math.cos(a) * 48, y = Math.sin(a) * 48;
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={x} y2={y} stroke="#e8eef4" strokeWidth="0.8" />
                <circle cx={x} cy={y} r="3.4" fill={["#e63946", "#ffb703", "#219ebc", "#8ecae6"][i % 4]} />
              </g>
            );
          })}
        </g>
        <circle r="4" fill="#e8eef4" />
      </g>
      </g>
      {/* línea de árboles + llanura */}
      <path transform="translate(0 -40)" d="M0 226 Q20 212 40 224 Q60 210 80 222 Q100 212 120 224 Q150 208 180 222 Q210 212 240 224 Q270 210 300 222 Q340 212 380 224 Q420 210 460 222 Q500 212 540 224 Q580 210 620 222 Q660 212 700 224 Q740 210 780 222 Q820 212 860 224 Q900 210 940 222 Q980 212 1020 224 Q1060 210 1100 222 Q1150 212 1200 222 V240 H0 Z" fill="#3f6b3a" />
      <rect y="192" width={W} height={H - 192} fill="url(#f1-field)" />
    </svg>
  );
}

/* ───────────── Primer plano: cerezos, pétalos, recta ───────────── */
function blossomTree(seed: number, cx: number, cy: number, rx: number, ry: number) {
  const r = rng(seed);
  const pinks = ["#f9c5d5", "#f4a6c0", "#fbdbe6", "#ee8fb0", "#fff0f5"];
  return Array.from({ length: 420 }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, r: 5 + r() * 10, c: pinks[Math.floor(r() * pinks.length)], o: 0.75 + r() * 0.25 };
  }).sort((a, b) => a.y - b.y);
}

function Foreground() {
  const left = useMemo(() => blossomTree(11, 70, 70, 170, 95), []);
  const right = useMemo(() => blossomTree(23, 1150, 80, 170, 100), []);
  const petals = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 34 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? 20 + r() * 230 : 960 + r() * 230,
        y: 60 + r() * 110,
        dx: (fromLeft ? 1 : -1) * (60 + r() * 160),
        dy: 260 + r() * 120,
        rot: 180 + r() * 540,
        dur: 7 + r() * 6,
        delay: -r() * 13,
        c: ["#f9c5d5", "#f4a6c0", "#fff0f5"][i % 3],
      };
    });
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      {/* recta: hierba, piano, asfalto */}
      <rect y="340" width={W} height="80" fill="#4f8636" />
      <rect y="350" width={W} height="9" fill="url(#f1-kerb)" />
      <defs>
        <pattern id="f1-kerb" width="44" height="9" patternUnits="userSpaceOnUse">
          <rect width="22" height="9" fill="#e10600" /><rect x="22" width="22" height="9" fill="#f5f5f5" />
        </pattern>
        <linearGradient id="f1-asphalt" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a4d53" /><stop offset="1" stopColor="#2f3236" />
        </linearGradient>
      </defs>
      <rect y="359" width={W} height="61" fill="url(#f1-asphalt)" />
      <rect y="361" width={W} height="2" fill="#f5f5f2" opacity="0.9" />

      {/* troncos */}
      <g fill="#4a3226">
        <path d="M60 420 C66 330 54 250 84 170 L96 174 C76 250 90 330 92 420 Z" />
        <path d="M82 230 C120 190 170 170 220 150 L224 158 C176 180 130 200 92 244 Z" />
        <path d="M76 200 C50 160 20 140 -10 130 L-8 122 C26 130 58 150 86 188 Z" />
        <path d="M1140 420 C1134 330 1150 250 1118 172 L1106 176 C1128 252 1112 330 1108 420 Z" />
        <path d="M1120 236 C1080 196 1030 176 980 158 L976 166 C1024 186 1070 206 1108 250 Z" />
      </g>
      {/* copas */}
      {[left, right].map((tree, t) => (
        <g key={t}>
          {tree.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={b.o} />)}
        </g>
      ))}
      {/* pétalos */}
      {petals.map((p, i) => (
        <ellipse
          key={i}
          className="f1-petal"
          cx={p.x}
          cy={p.y}
          rx="3.6"
          ry="2.2"
          fill={p.c}
          style={{ ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--rot" as string]: `${p.rot}deg`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </svg>
  );
}

const CSS = `
.f1-spin { animation: f1-spin 0.18s linear infinite; }
@keyframes f1-spin { to { transform: rotate(360deg); } }
.f1-ferris { animation: f1-spin 60s linear infinite; }
.f1-clouds { animation: f1-clouds 40s ease-in-out infinite alternate; }
@keyframes f1-clouds { to { transform: translateX(60px); } }
.f1-petal { transform-box: fill-box; transform-origin: center; animation: f1-petal 10s linear infinite; }
@keyframes f1-petal {
  0% { transform: translate(0, 0) rotate(0); opacity: 0; }
  8% { opacity: 1; }
  50% { transform: translate(calc(var(--dx) * 0.6), calc(var(--dy) * 0.45)) rotate(calc(var(--rot) * 0.5)); }
  90% { opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
}
.f1-pass { position: absolute; left: 0; animation: f1-pass ${CYCLE}s linear infinite; will-change: transform; }
@keyframes f1-pass {
  0% { transform: translateX(-32cqw); }
  13% { transform: translateX(112cqw); }
  100% { transform: translateX(112cqw); }
}
.f1-trail { position: absolute; right: 92%; top: 30%; width: 70%; height: 46%;
  background: repeating-linear-gradient(180deg, transparent 0 6px, rgba(255,255,255,.55) 6px 7.5px);
  -webkit-mask-image: linear-gradient(to right, transparent, #000); mask-image: linear-gradient(to right, transparent, #000); }
.f1-tilt { transform: perspective(1100px) rotateX(62deg); transform-origin: 50% 100%; }
${REDUCED_CSS}
`;

export default function F1Scene() {
  return (
    <SceneFrame label="Suzuka International Racing Course" coords="34.84°N 136.54°E">
      <style>{CSS}</style>
      <Backdrop />
      {/* trazado en perspectiva sobre la llanura */}
      <div className="absolute" style={{ left: "13%", width: "74%", bottom: "16%", aspectRatio: "640 / 300" }}>
        <div className="f1-tilt h-full w-full">
          <SuzukaTrack />
        </div>
      </div>
      <Foreground />
      {/* monoplazas pasando por la recta */}
      {PASSES.map((p) => (
        <div
          key={p.car}
          className="f1-pass"
          style={{
            animationDelay: `${p.at - CYCLE}s`,
            bottom: p.lane === 0 ? "1.5%" : "7.5%",
            width: p.lane === 0 ? "19cqw" : "16.5cqw",
            zIndex: p.lane === 0 ? 3 : 2,
            filter: p.lane === 1 ? "brightness(0.92)" : undefined,
          }}
        >
          <div className="f1-trail" />
          <F1Car l={LIVERIES[p.car]} />
        </div>
      ))}
    </SceneFrame>
  );
}
