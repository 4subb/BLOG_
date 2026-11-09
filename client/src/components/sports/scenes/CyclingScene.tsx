import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { REDUCED_CSS, SceneFrame, W, H, rng, smoothPath, type Pt } from "./shared";

/*
 * Ciclismo · Alpes suizos: cumbres nevadas (con una pirámide tipo Cervino), lago turquesa con el
 * reflejo de las montañas, un puerto en zigzag por donde trepa el pelotón en miniatura, y en primer
 * plano la carretera junto al lago por la que pasan corredores sobre bicis de gama WorldTour
 * (esquemas de color inspirados en Pinarello, Colnago y Cervélo; sin logotipos). El pedaleo es
 * cinemática real: el pie sigue al pedal y la rodilla se resuelve con dos segmentos (muslo y pierna).
 */

/* ───────────── Corredor + bici (lienzo con el suelo en y=0, mirando a la derecha) ───────────── */
type Kit = { name: string; frame: string; frameAccent: string; jersey: string; jerseyAccent: string; shorts: string; helmet: string; rim: string; wavy?: boolean };

const KITS: Record<string, Kit> = {
  // Dogma: horquilla y tirantes ondulados, negro con degradado rojo
  pinarello: { name: "Pinarello", frame: "#16161a", frameAccent: "#c8102e", jersey: "#13294b", jerseyAccent: "#c8102e", shorts: "#0e1424", helmet: "#13294b", rim: "#c8102e", wavy: true },
  // V4Rs: blanco con detalles negros
  colnago: { name: "Colnago", frame: "#f1f1ef", frameAccent: "#111111", jersey: "#f4f4f4", jerseyAccent: "#d6001c", shorts: "#111111", helmet: "#f4f4f4", rim: "#d6001c" },
  // S5: negro con amarillo
  cervelo: { name: "Cervélo", frame: "#121212", frameAccent: "#ffd100", jersey: "#ffd100", jerseyAccent: "#111111", shorts: "#111111", helmet: "#ffd100", rim: "#ffd100" },
};

const SKIN = "#e3b48f";
const R: Pt = [-42, -28];
const F: Pt = [41, -28];
const WR = 28;
const BB: Pt = [-1, -22];
const CRANK = 12;
const HIP: Pt = [-16, -78];
const THIGH = 36;
const SHIN = 40;
const FRAMES = 24;

const f = (n: number) => n.toFixed(1);

function knee(p: Pt): Pt {
  const dx = p[0] - HIP[0], dy = p[1] - HIP[1];
  const d = Math.min(Math.hypot(dx, dy), THIGH + SHIN - 0.5);
  const a = (THIGH * THIGH - SHIN * SHIN + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));
  const ux = dx / d, uy = dy / d;
  const bx = HIP[0] + a * ux, by = HIP[1] + a * uy;
  const k1: Pt = [bx - h * uy, by + h * ux];
  const k2: Pt = [bx + h * uy, by - h * ux];
  return k1[0] > k2[0] ? k1 : k2; // la rodilla siempre hacia delante
}

/** Fotogramas de una pierna: muslo, culote, pierna, zapatilla y biela. */
function legFrames(phase: number) {
  const thigh: string[] = [], shorts: string[] = [], shin: string[] = [], shoe: string[] = [], crank: string[] = [];
  for (let i = 0; i <= FRAMES; i++) {
    const t = phase + (i / FRAMES) * Math.PI * 2;
    const p: Pt = [BB[0] + Math.cos(t) * CRANK, BB[1] + Math.sin(t) * CRANK];
    const k = knee(p);
    const mid: Pt = [HIP[0] + (k[0] - HIP[0]) * 0.72, HIP[1] + (k[1] - HIP[1]) * 0.72];
    // tobillo un poco por encima/detrás del pedal
    const ank: Pt = [p[0] - 3, p[1] - 4];
    thigh.push(`M${f(HIP[0])} ${f(HIP[1])}L${f(k[0])} ${f(k[1])}`);
    shorts.push(`M${f(HIP[0])} ${f(HIP[1])}L${f(mid[0])} ${f(mid[1])}`);
    shin.push(`M${f(k[0])} ${f(k[1])}L${f(ank[0])} ${f(ank[1])}`);
    shoe.push(`M${f(ank[0] - 2)} ${f(ank[1])}L${f(p[0] + 7)} ${f(p[1] + 1)}`);
    crank.push(`M${f(BB[0])} ${f(BB[1])}L${f(p[0])} ${f(p[1])}`);
  }
  return { thigh, shorts, shin, shoe, crank };
}

const NEAR = legFrames(0);
const FAR = legFrames(Math.PI);
const CADENCE = "0.85s";

function Anim({ frames, base }: { frames: string[]; base: Record<string, string | number> }) {
  const reduce = useReducedMotion();
  return (
    <path d={frames[0]} {...base} fill="none" strokeLinecap="round">
      {!reduce && <animate attributeName="d" values={frames.join(";")} dur={CADENCE} repeatCount="indefinite" />}
    </path>
  );
}

function Leg({ legs, k, far }: { legs: typeof NEAR; k: Kit; far?: boolean }) {
  return (
    <g style={far ? { filter: "brightness(0.72)" } : undefined}>
      <Anim frames={legs.thigh} base={{ stroke: SKIN, strokeWidth: 8 }} />
      <Anim frames={legs.shorts} base={{ stroke: k.shorts, strokeWidth: 9 }} />
      <Anim frames={legs.shin} base={{ stroke: SKIN, strokeWidth: 6 }} />
      <Anim frames={legs.shoe} base={{ stroke: "#f2f2f2", strokeWidth: 4.5 }} />
    </g>
  );
}

function BikeWheel({ c, k }: { c: Pt; k: Kit }) {
  return (
    <g transform={`translate(${c[0]} ${c[1]})`}>
      <circle r={WR} fill="none" stroke="#141414" strokeWidth="3.4" />
      {/* llanta de perfil alto */}
      <circle r={WR - 6} fill="none" stroke="#1c1d20" strokeWidth="8" />
      <g className="cy-spin">
        <circle r={WR - 6} fill="none" stroke={k.rim} strokeWidth="2.2" strokeDasharray="10 24" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={0} y1={0} x2={Math.cos(a) * (WR - 10)} y2={Math.sin(a) * (WR - 10)} stroke="#8a8d93" strokeWidth="0.6" />;
        })}
      </g>
      <circle r="2.6" fill="#c8ccd2" />
    </g>
  );
}

export function Rider({ k }: { k: Kit }) {
  const stays = k.wavy ? "M-12 -56 Q-24 -46 -26 -40 T-42 -28" : "M-11 -52 L-42 -28";
  const fork = k.wavy ? "M34 -52 Q42 -44 37 -38 T41 -28" : "M34 -52 Q40 -40 41 -28";
  return (
    <svg viewBox="-76 -124 142 128" className="block h-auto w-full overflow-visible" aria-hidden>
      <ellipse cx="0" cy="1" rx="62" ry="3" fill="#000" opacity="0.25" />
      {/* pierna y biela lejanas */}
      <Leg legs={FAR} k={k} far />
      <Anim frames={FAR.crank} base={{ stroke: "#3a3c40", strokeWidth: 3 }} />

      <BikeWheel c={R} k={k} />
      <BikeWheel c={F} k={k} />

      {/* transmisión */}
      <circle cx={BB[0]} cy={BB[1]} r="9" fill="none" stroke="#5c6066" strokeWidth="2.2" />
      <path d={`M${BB[0]} ${BB[1] - 9} L${R[0]} ${R[1] - 4} M${BB[0]} ${BB[1] + 9} L${R[0]} ${R[1] + 4}`} stroke="#6b6f75" strokeWidth="1" />
      <circle cx={R[0]} cy={R[1]} r="4.5" fill="none" stroke="#6b6f75" strokeWidth="1.6" />

      {/* cuadro */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-1 -22 L-42 -28" stroke={k.frame} strokeWidth="3.6" />
        <path d={stays} stroke={k.frame} strokeWidth="3" />
        <path d="M-1 -22 L-15 -66" stroke={k.frame} strokeWidth="5.5" />
        <path d="M-15 -64 L31 -66" stroke={k.frame} strokeWidth="4.6" />
        <path d="M33 -57 L-1 -22" stroke={k.frame} strokeWidth="6.5" />
        <path d="M31 -67 L34 -52" stroke={k.frame} strokeWidth="6.5" />
        <path d={fork} stroke={k.frame} strokeWidth="4" />
        {/* detalles de color del fabricante */}
        <path d="M24 -51 L8 -35" stroke={k.frameAccent} strokeWidth="2.2" />
        <path d="M-6 -36 L-11 -52" stroke={k.frameAccent} strokeWidth="1.8" />
        <path d="M2 -65 L22 -66" stroke={k.frameAccent} strokeWidth="1.4" />
        {/* tija, sillín, potencia y manillar */}
        <path d="M-15 -66 L-17 -73" stroke="#1a1a1a" strokeWidth="4" />
        <path d="M-28 -75 Q-17 -78 -6 -74" stroke="#1a1a1a" strokeWidth="3.6" />
        <path d="M31 -68 L41 -69" stroke="#1a1a1a" strokeWidth="3.6" />
        <path d="M41 -69 L45 -69 Q50 -69 49 -62 Q48 -55 43 -55" stroke="#1a1a1a" strokeWidth="3" />
      </g>

      {/* pierna y biela cercanas */}
      <Anim frames={NEAR.crank} base={{ stroke: "#2a2c30", strokeWidth: 3.4 }} />
      <Leg legs={NEAR} k={k} />

      {/* torso, brazo y cabeza */}
      <circle cx={HIP[0]} cy={HIP[1]} r="7" fill={k.shorts} />
      <path d="M-15 -79 Q2 -101 21 -100" stroke={k.jersey} strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M-6 -90 Q6 -100 21 -100" stroke={k.jerseyAccent} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M22 -100 L31 -85" stroke={k.jersey} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M31 -85 L44 -70" stroke={SKIN} strokeWidth="4.6" strokeLinecap="round" />
      <circle cx="44.5" cy="-69.5" r="2.6" fill="#1a1a1a" />
      <path d="M24 -103 L29 -106" stroke={SKIN} strokeWidth="5" strokeLinecap="round" />
      <circle cx="31" cy="-108" r="7" fill={SKIN} />
      {/* casco aero + gafas */}
      <path d="M20 -110 C22 -121 38 -122 41 -111 L39 -108 L23 -107 Z" fill={k.helmet} />
      <path d="M27 -114 L35 -115" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.5" />
      <path d="M32 -109 h8 v3 h-8 z" fill="#1d1f26" />
    </svg>
  );
}

/* ───────────── Paisaje ───────────── */
const FAR_RANGE =
  "M0 220 L60 160 L95 178 L150 110 L190 140 L230 96 L280 150 L330 120 L390 168 L440 130 L500 178 L560 150 L620 182 L700 120 L742 64 L760 34 L772 46 L800 104 L840 140 L900 112 L950 150 L1010 100 L1060 140 L1120 118 L1200 160 L1200 240 L0 240 Z";
const SNOW = [
  "M150 110 L134 130 L146 128 L152 136 L160 126 L170 130 Z",
  "M230 96 L214 116 L226 114 L232 124 L240 112 L254 118 Z",
  "M760 34 L742 64 L730 92 L746 84 L752 98 L762 80 L772 96 L780 76 L792 88 L800 104 L772 46 Z",
  "M1010 100 L994 120 L1006 118 L1012 128 L1020 116 L1034 120 Z",
  "M440 130 L424 148 L436 146 L442 154 L452 144 L462 148 Z",
  "M700 120 L688 136 L700 134 L708 142 L716 128 Z",
];
// Caras en sombra de cada cumbre (de la cima al siguiente collado): da volumen a la cordillera
function facets(d: string, base: number) {
  const pts = (d.match(/L\d+ \d+/g) ?? []).map((m) => m.slice(1).split(" ").map(Number) as Pt);
  const out: string[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    if (y < pts[i - 1][1] && y < pts[i + 1][1]) {
      const [vx, vy] = pts[i + 1];
      out.push(`M${x} ${y} L${vx} ${vy} L${vx - (vx - x) * 0.15} ${base} L${x + (vx - x) * 0.25} ${base} Z`);
    }
  }
  return out;
}
const FAR_FACETS = facets(FAR_RANGE, 240);
const MID_RANGE = "M0 250 L70 196 L120 214 L190 168 L240 200 L300 176 L370 222 L430 206 L520 240 L640 236 L740 214 L820 182 L870 204 L940 172 L1010 210 L1080 186 L1150 214 L1200 200 L1200 262 L0 262 Z";
const MID_FACETS = facets(MID_RANGE, 262);

// Puerto en zigzag sobre la ladera derecha
const PASS: Pt[] = [[820, 300], [960, 286], [1040, 270], [930, 258], [860, 246], [970, 232], [1060, 220], [960, 206], [900, 194], [1000, 182], [1090, 170]];
const PASS_D = smoothPath(PASS, false, 0.6);

function Landscape() {
  const pines = useMemo(() => {
    const r = rng(42);
    const out: { x: number; y: number; s: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const left = i < 38;
      const x = left ? r() * 330 : 780 + r() * 420;
      const y = 270 + r() * 70;
      out.push({ x, y, s: 0.6 + r() * 0.9 });
    }
    return out.sort((a, b) => a.y - b.y);
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="cy-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5f9ad6" /><stop offset="1" stopColor="#d9eaf6" />
        </linearGradient>
        <linearGradient id="cy-far" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7d93b0" /><stop offset="1" stopColor="#a9bccf" />
        </linearGradient>
        <linearGradient id="cy-lake" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#44b7c4" /><stop offset="1" stopColor="#1b7b94" />
        </linearGradient>
        <linearGradient id="cy-meadow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7cb85a" /><stop offset="1" stopColor="#4d8b38" />
        </linearGradient>
        <linearGradient id="cy-slope" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6f9a62" /><stop offset="1" stopColor="#3f7246" />
        </linearGradient>
        <linearGradient id="cy-haze" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="0.35" /></linearGradient>
        <filter id="cy-blur"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#cy-sky)" />
      {/* nubes */}
      <g className="cy-clouds" fill="#fff" opacity="0.85">
        <ellipse cx="260" cy="58" rx="80" ry="14" /><ellipse cx="300" cy="48" rx="44" ry="14" />
        <ellipse cx="980" cy="52" rx="70" ry="12" /><ellipse cx="1010" cy="44" rx="34" ry="11" />
      </g>
      {/* parapente */}
      <g className="cy-glider">
        <path d="M-14 0 Q0 -8 14 0 Q0 -4 -14 0 Z" fill="#ff6b35" />
        <path d="M-12 0 L0 16 L12 0" stroke="#333" strokeWidth="0.4" fill="none" />
        <circle cx="0" cy="17" r="1.6" fill="#333" />
      </g>

      {/* cordillera lejana + nieve */}
      <path d={FAR_RANGE} fill="url(#cy-far)" />
      {FAR_FACETS.map((d, i) => <path key={i} d={d} fill="#2b3a52" opacity="0.18" />)}
      {SNOW.map((d, i) => <path key={i} d={d} fill="#f7fafc" />)}
      <path d="M760 34 L772 46 L800 104 L790 98 L780 76 Z" fill="#d9e2ec" />
      {/* glaciar */}
      <path d="M720 140 Q760 120 790 150 Q770 160 740 158 Z" fill="#eaf2f8" opacity="0.8" />

      {/* bruma de valle + cordillera media */}
      <rect y="150" width={W} height="100" fill="url(#cy-haze)" />
      <path d={MID_RANGE} fill="#5f7d86" />
      {MID_FACETS.map((d, i) => <path key={i} d={d} fill="#1d2f3a" opacity="0.25" />)}
      <path d="M190 168 L178 182 L188 180 L194 188 L200 178 L208 182 Z M820 182 L808 196 L818 194 L824 202 L832 192 L840 196 Z M940 172 L928 186 L938 184 L944 192 L950 182 L958 186 Z" fill="#eef3f7" />
      {/* laderas medias (izquierda y derecha) */}
      <path d="M0 200 C80 170 160 190 260 230 L340 262 L0 262 Z" fill="url(#cy-slope)" />
      <path d="M1200 140 C1100 150 980 190 860 240 L760 262 L1200 262 Z" fill="url(#cy-slope)" />
      {/* puerto con curvas de herradura */}
      <path d={PASS_D} fill="none" stroke="#e9e4da" strokeWidth="5" strokeLinecap="round" />
      <path d={PASS_D} fill="none" stroke="#9a9a96" strokeWidth="3" strokeLinecap="round" />
      {["#ffd100", "#13294b", "#f4f4f4", "#e30613", "#1868db"].map((c, i) => (
        <circle key={c} r="2.4" fill={c} stroke="#222" strokeWidth="0.5">
          <animateMotion dur="26s" begin={`${-i * 1.3}s`} repeatCount="indefinite" path={PASS_D} />
        </circle>
      ))}

      {/* lago: agua, reflejo y brillos */}
      <rect y="250" width={W} height="62" fill="url(#cy-lake)" />
      <g transform="translate(0 500) scale(1 -1)" opacity="0.28" filter="url(#cy-blur)">
        <path d={FAR_RANGE} fill="#d8e6ef" />
        {SNOW.map((d, i) => <path key={i} d={d} fill="#ffffff" />)}
      </g>
      <g className="cy-shimmer" stroke="#ffffff" strokeLinecap="round" opacity="0.55">
        {[[120, 262, 40], [380, 270, 60], [640, 258, 30], [820, 276, 50], [1040, 266, 44], [260, 290, 36], [700, 296, 52], [980, 300, 30]].map(([x, y, w]) => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x + w} y2={y} strokeWidth="1.4" />
        ))}
      </g>
      {/* barco */}
      <g className="cy-boat">
        <path d="M-18 0 H18 L13 6 H-13 Z" fill="#f4f4f4" />
        <rect x="-8" y="-6" width="14" height="6" fill="#f4f4f4" />
        <rect x="-6" y="-5" width="10" height="2" fill="#2d6a8a" />
        <rect x="2" y="-11" width="1.5" height="5" fill="#d52b1e" />
      </g>

      {/* pueblo junto al lago */}
      <g transform="translate(420 300)">
        {[[0, 0, 26, "#f2e6d0"], [32, 4, 22, "#eadbc0"], [60, -2, 30, "#f4ead8"], [98, 3, 22, "#e8d6b8"]].map(([x, y, w, c]) => (
          <g key={x as number} transform={`translate(${x} ${y})`}>
            <rect y="-14" width={w as number} height="14" fill={c as string} />
            <path d={`M-3 -14 L${(w as number) / 2} -26 L${(w as number) + 3} -14 Z`} fill="#7a3b2e" />
            <rect x="5" y="-10" width="4" height="4" fill="#4b6b8a" />
          </g>
        ))}
        {/* campanario con bandera suiza */}
        <rect x="134" y="-38" width="10" height="38" fill="#f4ead8" />
        <path d="M132 -38 L139 -52 L146 -38 Z" fill="#4f5d4a" />
        <rect x="146" y="-50" width="10" height="10" fill="#d52b1e" />
        <path d="M151 -48 V-42 M148 -45 H154" stroke="#fff" strokeWidth="2" />
      </g>

      {/* prado + pinos */}
      <path d="M0 312 C200 300 420 318 640 308 C860 298 1040 314 1200 304 V420 H0 Z" fill="url(#cy-meadow)" />
      {pines.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          <rect x="-1.5" y="-4" width="3" height="6" fill="#4a3226" />
          <path d="M0 -40 L-10 -18 L-6 -18 L-13 -4 L13 -4 L6 -18 L10 -18 Z" fill={i % 3 ? "#24513a" : "#2f6146"} />
        </g>
      ))}

      {/* carretera del lago: muro, quitamiedos, asfalto */}
      <rect y="340" width={W} height="10" fill="#b9b2a4" />
      <g stroke="#9aa0a6" strokeWidth="2">
        <line x1="0" y1="344" x2={W} y2="344" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 42 + 10} y1="344" x2={i * 42 + 10} y2="352" />)}
      </g>
      <rect y="350" width={W} height="70" fill="#4b4e53" />
      <rect y="352" width={W} height="2" fill="#efefe8" opacity="0.85" />
      <line x1="0" y1="392" x2={W} y2="392" stroke="#f2d64b" strokeWidth="2" strokeDasharray="28 22" opacity="0.8" />
      {/* poste kilométrico de puerto */}
      <g transform="translate(150 346)">
        <rect x="-5" y="-30" width="10" height="30" fill="#f4f4f4" />
        <rect x="-5" y="-30" width="10" height="7" fill="#d52b1e" />
      </g>
    </svg>
  );
}

/* ───────────── Pasos por la carretera ───────────── */
const RIDES: { kit: keyof typeof KITS; at: number; lane: 0 | 1 }[] = [
  { kit: "pinarello", at: 0, lane: 0 },
  { kit: "cervelo", at: 6.6, lane: 1 },
  { kit: "colnago", at: 6.2, lane: 0 },
];
const CYCLE = 16;

const CSS = `
.cy-spin { animation: cy-spin 0.6s linear infinite; }
@keyframes cy-spin { to { transform: rotate(360deg); } }
.cy-clouds { animation: cy-clouds 50s ease-in-out infinite alternate; }
@keyframes cy-clouds { to { transform: translateX(80px); } }
.cy-shimmer { animation: cy-shimmer 4s ease-in-out infinite alternate; }
@keyframes cy-shimmer { from { transform: translateX(-14px); opacity: .25; } to { transform: translateX(14px); opacity: .7; } }
.cy-boat { animation: cy-boat 60s linear infinite; }
@keyframes cy-boat { from { transform: translate(-60px, 284px); } to { transform: translate(1260px, 284px); } }
.cy-glider { animation: cy-glider 34s ease-in-out infinite; }
@keyframes cy-glider {
  0% { transform: translate(520px, 70px) rotate(-4deg); }
  50% { transform: translate(640px, 104px) rotate(6deg); }
  100% { transform: translate(520px, 70px) rotate(-4deg); }
}
.cy-ride { position: absolute; left: 0; animation: cy-ride ${CYCLE}s linear infinite; will-change: transform; }
@keyframes cy-ride {
  0% { transform: translateX(-16cqw); }
  62% { transform: translateX(108cqw); }
  100% { transform: translateX(108cqw); }
}
${REDUCED_CSS}
`;

export default function CyclingScene() {
  return (
    <SceneFrame label="Alpes suizos · lago y puerto de montaña" coords="46.55°N 8.56°E">
      <style>{CSS}</style>
      <Landscape />
      {RIDES.map((r) => (
        <div
          key={r.kit}
          className="cy-ride"
          style={{
            animationDelay: `${r.at - CYCLE}s`,
            bottom: r.lane === 0 ? "1%" : "9%",
            width: r.lane === 0 ? "15cqw" : "13cqw",
            zIndex: r.lane === 0 ? 3 : 2,
          }}
        >
          <Rider k={KITS[r.kit]} />
        </div>
      ))}
    </SceneFrame>
  );
}
