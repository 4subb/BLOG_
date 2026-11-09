import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { REDUCED_CSS, SceneFrame, W, H, rng } from "./shared";

/*
 * Tenis · vista cenital de una pista central. Va rotando entre Roland-Garros (tierra batida),
 * Wimbledon (hierba a rayas) y el US Open (pista dura azul). Las gradas están llenas: el público
 * hace la ola alrededor del estadio, salta algún flash y celebra cada punto. En la pista, dos
 * jugadores pelotean de verdad: la bola vuela con su sombra (bota antes de llegar), el que recibe
 * corre a por ella y golpea; cada pocos golpes sale un ganador y se actualiza el marcador.
 */

/* ───────────── Geometría de la pista (18 px ≈ 1 m) ───────────── */
const CX = 600, CY = 210;
const HALF_L = 214, HALF_DW = 99, HALF_SW = 74, SERVICE = 115;
const COURT = { x: CX - HALF_L, y: CY - HALF_DW, width: HALF_L * 2, height: HALF_DW * 2 };
const SURROUND = { x: CX - HALF_L - 115, y: CY - HALF_DW - 66, width: HALF_L * 2 + 230, height: HALF_DW * 2 + 132 };

type Venue = {
  key: string; name: string; coords: string;
  court: string; surround: string; wall: string; seats: string; lines: string; accent: string; grass?: boolean;
};
const VENUES: Venue[] = [
  { key: "rg", name: "Roland-Garros · Court Philippe-Chatrier", coords: "48.85°N 2.25°E", court: "#c8643c", surround: "#bd5a33", wall: "#0b5d3b", seats: "#4c5a52", lines: "#fbf6ee", accent: "#e8a24a" },
  { key: "wim", name: "Wimbledon · Centre Court", coords: "51.43°N 0.21°W", court: "#5f9f3e", surround: "#5a9a3a", wall: "#134a2c", seats: "#1f5132", lines: "#ffffff", accent: "#5b2d82", grass: true },
  { key: "uso", name: "US Open · Arthur Ashe Stadium", coords: "40.75°N 73.85°W", court: "#3b6aa0", surround: "#5f8f57", wall: "#1d2a5c", seats: "#1d3c6e", lines: "#ffffff", accent: "#f2c230" },
];
const VENUE_MS = 16000;

/* ───────────── Público ───────────── */
const SECTORS = 40;
type Fan = { x: number; y: number; c: string; s: number };

function buildCrowd() {
  const r = rng(99);
  const shirts = ["#d6d2c4", "#f1efe8", "#a8c5d6", "#5b7fa3", "#2e3f5c", "#e3c16f", "#d98c5f", "#5f9e92", "#c9b98f", "#b5554f", "#3d4a52", "#ffffff", "#8a7fb0", "#e8e2d0"];
  const sectors: Fan[][] = Array.from({ length: SECTORS }, () => []);
  const pad = 10;
  for (let y = 4; y < H; y += 8) {
    for (let x = 4; x < W; x += 8) {
      const inside = x > SURROUND.x - pad && x < SURROUND.x + SURROUND.width + pad && y > SURROUND.y - pad && y < SURROUND.y + SURROUND.height + pad;
      if (inside || r() < 0.08) continue; // algún asiento vacío
      const jx = x + (r() - 0.5) * 2, jy = y + (r() - 0.5) * 2;
      const a = Math.atan2(jy - CY, (jx - CX) * 0.45);
      const sec = Math.floor(((a + Math.PI) / (Math.PI * 2)) * SECTORS) % SECTORS;
      sectors[sec].push({ x: jx, y: jy, c: shirts[Math.floor(r() * shirts.length)], s: 0.8 + r() * 0.5 });
    }
  }
  const flashes = Array.from({ length: 26 }, () => {
    const all = sectors[Math.floor(r() * SECTORS)];
    const f = all[Math.floor(r() * all.length)];
    return { x: f.x, y: f.y, d: -r() * 7, dur: 4 + r() * 5 };
  });
  return { sectors, flashes };
}

const Crowd = memo(function Crowd({ seats, cheer }: { seats: string; cheer: number }) {
  const { sectors, flashes } = useMemo(buildCrowd, []);
  return (
    <g>
      {/* gradas (filas de asientos) */}
      <rect width={W} height={H} fill={seats} style={{ transition: "fill 1.2s" }} />
      <g stroke="#000" strokeOpacity="0.18" strokeWidth="1">
        {Array.from({ length: 12 }, (_, i) => {
          const g = 8 + i * 16;
          return <rect key={i} x={SURROUND.x - g} y={SURROUND.y - g} width={SURROUND.width + g * 2} height={SURROUND.height + g * 2} rx={10 + i * 6} fill="none" />;
        })}
      </g>
      {/* escaleras de acceso */}
      <g stroke="#d9d4c7" strokeOpacity="0.35" strokeWidth="3">
        {[-1, 1].flatMap((s) => [0.25, 0.75].map((k) => (
          <line key={`${s}${k}`} x1={CX + s * (SURROUND.width / 2)} y1={SURROUND.y + SURROUND.height * k} x2={CX + s * 640} y2={CY + (k - 0.5) * 520} />
        )))}
      </g>
      {/* aficionados: torso + cabeza; cada sector levanta los brazos cuando le llega la ola */}
      {sectors.map((fans, i) => (
        <g key={i}>
          {fans.map((f, j) => (
            <g key={j}>
              <ellipse cx={f.x} cy={f.y + 0.6} rx={3 * f.s} ry={2.1 * f.s} fill={f.c} />
              <circle cx={f.x} cy={f.y - 1.2} r={1.25 * f.s} fill={["#3b2a1f", "#6b4a32", "#c9a27a", "#1f1a17", "#a7764d"][j % 5]} />
            </g>
          ))}
          <g className="tn-wave" style={{ animationDelay: `${(i / SECTORS) * 9}s` }}>
            {fans.filter((_, j) => j % 2 === 0).map((f, j) => (
              <path key={j} d={`M${f.x - 3} ${f.y - 1} l-1.2 -3.5 M${f.x + 3} ${f.y - 1} l1.2 -3.5`} stroke="#f3d2b3" strokeWidth="1.2" strokeLinecap="round" />
            ))}
          </g>
        </g>
      ))}
      {/* celebración del punto: todo el estadio en pie */}
      {cheer > 0 && (
        <g key={cheer} className="tn-cheer">
          {sectors.flat().filter((_, j) => j % 3 === 0).map((f, j) => (
            <path key={j} d={`M${f.x - 3} ${f.y - 1} l-1.4 -4 M${f.x + 3} ${f.y - 1} l1.4 -4`} stroke="#ffe8d2" strokeWidth="1.3" strokeLinecap="round" />
          ))}
        </g>
      )}
      {/* flashes de cámaras */}
      {flashes.map((f, i) => (
        <circle key={i} className="tn-flash" cx={f.x} cy={f.y} r="2.6" fill="#fff" style={{ animationDelay: `${f.d}s`, animationDuration: `${f.dur}s` }} />
      ))}
    </g>
  );
});

/* ───────────── Pista ───────────── */
function Court({ v }: { v: Venue }) {
  const t = { transition: "fill 1.2s, stroke 1.2s, opacity 1.2s" };
  const L = { stroke: v.lines, strokeWidth: 2.2, fill: "none", style: t };
  const x0 = COURT.x, x1 = COURT.x + COURT.width;
  return (
    <g>
      {/* muro perimetral + fondo */}
      <rect x={SURROUND.x - 7} y={SURROUND.y - 7} width={SURROUND.width + 14} height={SURROUND.height + 14} rx="6" fill={v.wall} style={t} />
      <rect {...SURROUND} fill={v.surround} style={t} />
      <rect {...COURT} fill={v.court} style={t} />
      {/* hierba a rayas + zonas gastadas (solo Wimbledon) */}
      <g opacity={v.grass ? 1 : 0} style={t}>
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={SURROUND.x + i * 30} y={SURROUND.y} width="15" height={SURROUND.height} fill="#ffffff" opacity="0.07" />
        ))}
        {[x0 + 8, x1 - 8].map((x) => <ellipse key={x} cx={x} cy={CY} rx="22" ry="34" fill="#b59a66" opacity="0.55" />)}
      </g>
      {/* marcas de la tierra batida (solo RG) */}
      <g opacity={v.key === "rg" ? 0.35 : 0} style={t} fill="none" stroke="#8f3f22" strokeWidth="1">
        <path d={`M${x0 + 20} ${CY - 40} q30 20 10 50 M${x1 - 30} ${CY + 30} q-25 -10 -14 -48 M${CX - 80} ${CY + 60} q20 8 34 -4`} />
      </g>
      {/* líneas */}
      <rect {...COURT} {...L} />
      <line x1={x0} y1={CY - HALF_SW} x2={x1} y2={CY - HALF_SW} {...L} />
      <line x1={x0} y1={CY + HALF_SW} x2={x1} y2={CY + HALF_SW} {...L} />
      <line x1={CX - SERVICE} y1={CY - HALF_SW} x2={CX - SERVICE} y2={CY + HALF_SW} {...L} />
      <line x1={CX + SERVICE} y1={CY - HALF_SW} x2={CX + SERVICE} y2={CY + HALF_SW} {...L} />
      <line x1={CX - SERVICE} y1={CY} x2={CX + SERVICE} y2={CY} {...L} />
      <line x1={x0} y1={CY} x2={x0 + 7} y2={CY} {...L} />
      <line x1={x1 - 7} y1={CY} x2={x1} y2={CY} {...L} />
      {/* banquillos, juez de silla y recogepelotas */}
      <rect x={CX - 40} y={SURROUND.y + SURROUND.height - 16} width="28" height="9" rx="2" fill={v.accent} style={t} />
      <rect x={CX + 12} y={SURROUND.y + SURROUND.height - 16} width="28" height="9" rx="2" fill={v.accent} style={t} />
      <g transform={`translate(${CX} ${COURT.y + COURT.height + 30})`}>
        <rect x="-7" y="-6" width="14" height="14" rx="2" fill={v.wall} style={t} />
        <circle r="4.5" fill="#2b2b2b" />
      </g>
      {[[CX, SURROUND.y + 8], [SURROUND.x + 10, SURROUND.y + 12], [SURROUND.x + 10, SURROUND.y + SURROUND.height - 12], [SURROUND.x + SURROUND.width - 10, SURROUND.y + 12], [SURROUND.x + SURROUND.width - 10, SURROUND.y + SURROUND.height - 12]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.5" fill={v.accent} style={t} />
          <circle cx={x} cy={y} r="2.4" fill="#3b2a1f" />
        </g>
      ))}
    </g>
  );
}

function Net() {
  return (
    <g>
      <rect x={CX - 1} y={COURT.y - 16} width="12" height={COURT.height + 32} fill="#000" opacity="0.18" />
      <line x1={CX} y1={COURT.y - 16} x2={CX} y2={COURT.y + COURT.height + 16} stroke="#1a1a1a" strokeWidth="3" />
      <line x1={CX} y1={COURT.y - 16} x2={CX} y2={COURT.y + COURT.height + 16} stroke="#f5f5f5" strokeWidth="1.2" />
      <rect x={CX - 3} y={COURT.y - 20} width="6" height="6" rx="1" fill="#2d6a4f" />
      <rect x={CX - 3} y={COURT.y + COURT.height + 14} width="6" height="6" rx="1" fill="#2d6a4f" />
    </g>
  );
}

/* ───────────── Jugadores (vista cenital, mirando hacia la red) ───────────── */
const RACKET: [number, number] = [26, 15]; // punto de golpeo relativo al cuerpo (mirando a la derecha)

function PlayerFigure({ shirt, hair, gref, rref, flip }: { shirt: string; hair: string; gref: React.Ref<SVGGElement>; rref: React.Ref<SVGGElement>; flip?: boolean }) {
  return (
    <g ref={gref}>
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <ellipse cx="5" cy="6" rx="14" ry="10" fill="#000" opacity="0.22" />
        <ellipse cx="-3" cy="-6" rx="4" ry="3" fill="#f2f2f2" />
        <ellipse cx="-3" cy="6" rx="4" ry="3" fill="#f2f2f2" />
        <ellipse cx="0" cy="0" rx="7.5" ry="13.5" fill={shirt} stroke="#000" strokeOpacity="0.25" />
        <g ref={rref}>
          <path d="M0 10 L13 15" stroke="#e0b089" strokeWidth="4" strokeLinecap="round" />
          <path d="M13 15 L19 15.5" stroke="#1a1a1a" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="26" cy="15.5" rx="7.5" ry="5.5" fill="#ffffff" fillOpacity="0.35" stroke="#1a1a1a" strokeWidth="2" />
        </g>
        <path d="M0 -10 L8 -12" stroke="#e0b089" strokeWidth="3.6" strokeLinecap="round" />
        <circle cx="1" cy="0" r="6" fill={hair} />
        <path d="M2 -4.5 A6 6 0 0 1 2 4.5" fill="none" stroke="#f5f5f5" strokeWidth="2" />
      </g>
    </g>
  );
}

/* ───────────── Peloteo ───────────── */
const BASE_X = [COURT.x - 16, COURT.x + COURT.width + 16];
const DIR = [1, -1];
const Y_MIN = COURT.y - 8, Y_MAX = COURT.y + COURT.height + 8;
const POINTS = ["0", "15", "30", "40"];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Score = { pts: [number, number]; games: [number, number] };

function useRally(reduce: boolean, onPoint: (winner: 0 | 1) => void) {
  const players = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
  const rackets = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
  const ball = useRef<SVGCircleElement>(null);
  const shadow = useRef<SVGEllipseElement>(null);
  const cb = useRef(onPoint);
  cb.current = onPoint;

  useEffect(() => {
    const pos: [number, number][] = [[BASE_X[0], CY + 30], [BASE_X[1], CY - 20]];
    const place = () => {
      players.forEach((p, i) => p.current?.setAttribute("transform", `translate(${pos[i][0].toFixed(1)} ${pos[i][1].toFixed(1)})`));
    };
    if (reduce) {
      place();
      ball.current?.setAttribute("cx", String(CX - 60)); ball.current?.setAttribute("cy", String(CY - 30));
      shadow.current?.setAttribute("cx", String(CX - 50)); shadow.current?.setAttribute("cy", String(CY - 10));
      return;
    }
    const rnd = Math.random;
    const swingAt = [-10, -10];
    let hitter: 0 | 1 = 0;
    let shot = { t0: 0, dur: 1, from: [0, 0], to: [0, 0], peak: 50, bounce: 0.7, winner: false, serve: true };
    let recvFrom: [number, number] = [0, 0], recvTo: [number, number] = [0, 0];
    let hitterFrom: [number, number] = [0, 0], hitterTo: [number, number] = [0, 0];
    let deadUntil = 0;
    let shotsLeft = 0;
    let raf = 0;

    const racketPoint = (i: number): [number, number] => [pos[i][0] + RACKET[0] * DIR[i], pos[i][1] + RACKET[1]];

    const newShot = (now: number, serve: boolean) => {
      const r = (1 - hitter) as 0 | 1;
      const winner = !serve && shotsLeft <= 0;
      const from = racketPoint(hitter);
      let ty: number;
      if (winner) {
        // a la línea contraria a donde está el que recibe
        ty = pos[r][1] < CY ? COURT.y + COURT.height - 10 : COURT.y + 10;
      } else {
        ty = serve ? (pos[hitter][1] > CY ? CY - 40 : CY + 40) : COURT.y + 18 + rnd() * (COURT.height - 36);
      }
      const bodyTo: [number, number] = [BASE_X[r] + (rnd() - 0.5) * 30, clamp(ty - RACKET[1], Y_MIN, Y_MAX)];
      const to: [number, number] = winner ? [BASE_X[r] + DIR[r] * -70, ty] : [bodyTo[0] + RACKET[0] * DIR[r], ty];
      shot = { t0: now, dur: serve ? 0.95 : 0.95 + rnd() * 0.35, from, to, peak: serve ? 70 : 40 + rnd() * 25, bounce: winner ? 0.62 : 0.72, winner, serve };
      recvFrom = [...pos[r]] as [number, number];
      recvTo = winner ? [lerp(pos[r][0], bodyTo[0], 0.5), lerp(pos[r][1], bodyTo[1], 0.55)] : bodyTo;
      hitterFrom = [...pos[hitter]] as [number, number];
      hitterTo = [BASE_X[hitter], lerp(pos[hitter][1], CY, 0.6)];
      swingAt[hitter] = now;
      shotsLeft--;
    };

    const startPoint = (now: number) => {
      // saque desde la derecha/izquierda del centro alternando
      const y = rnd() > 0.5 ? CY + 34 : CY - 34;
      pos[hitter] = [BASE_X[hitter] - DIR[hitter] * 6, y];
      pos[1 - hitter] = [BASE_X[1 - hitter] + DIR[1 - hitter] * -4, y > CY ? CY - 30 : CY + 30];
      shotsLeft = 4 + Math.floor(rnd() * 7);
      newShot(now, true);
    };

    const frame = (ms: number) => {
      const now = ms / 1000;
      if (shot.t0 === 0) startPoint(now);
      if (deadUntil) {
        if (now >= deadUntil) { deadUntil = 0; hitter = (1 - hitter) as 0 | 1; startPoint(now); }
      } else {
        const t = clamp((now - shot.t0) / shot.dur, 0, 1);
        const r = 1 - hitter;
        // movimiento de los jugadores
        const k = ease(clamp(t / 0.85, 0, 1));
        pos[r] = [lerp(recvFrom[0], recvTo[0], k), lerp(recvFrom[1], recvTo[1], k)];
        const kh = ease(clamp(t / 1, 0, 1));
        pos[hitter] = [lerp(hitterFrom[0], hitterTo[0], kh), lerp(hitterFrom[1], hitterTo[1], kh)];
        // bola: vuelo con bote
        const gx = lerp(shot.from[0], shot.to[0], t), gy = lerp(shot.from[1], shot.to[1], t);
        const h = t < shot.bounce ? shot.peak * Math.sin((Math.PI * t) / shot.bounce) : shot.peak * 0.4 * Math.sin((Math.PI * (t - shot.bounce)) / (1 - shot.bounce));
        ball.current?.setAttribute("cx", (gx + h * 0.25).toFixed(1));
        ball.current?.setAttribute("cy", (gy - h * 0.55).toFixed(1));
        ball.current?.setAttribute("r", (3.4 + h * 0.035).toFixed(2));
        shadow.current?.setAttribute("cx", gx.toFixed(1));
        shadow.current?.setAttribute("cy", gy.toFixed(1));
        if (t >= 1) {
          if (shot.winner) {
            deadUntil = now + 1.6;
            cb.current(hitter);
          } else {
            hitter = r as 0 | 1;
            newShot(now, false);
          }
        }
      }
      // golpe: el brazo con la raqueta barre de atrás hacia delante
      rackets.forEach((rk, i) => {
        const s = (now - swingAt[i]) / 0.38;
        const a = s >= 0 && s <= 1 ? lerp(-75, 55, ease(s)) : s > 1 && s < 1.8 ? lerp(55, -10, (s - 1) / 0.8) : -10;
        rk.current?.setAttribute("transform", `rotate(${a.toFixed(1)} 0 10)`);
      });
      place();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return { players, rackets, ball, shadow };
}

/* ───────────── Escena ───────────── */
const CSS = `
.tn-wave { opacity: 0; animation: tn-wave 9s linear infinite; }
@keyframes tn-wave { 0% { opacity: 0; } 2% { opacity: 1; } 7% { opacity: 1; } 10%, 100% { opacity: 0; } }
.tn-cheer { animation: tn-cheer 1.6s ease-out both; }
@keyframes tn-cheer { 0% { opacity: 0; } 12%, 30%, 50% { opacity: 1; } 22%, 40% { opacity: .3; } 100% { opacity: 0; } }
.tn-flash { opacity: 0; animation: tn-flash 6s linear infinite; }
@keyframes tn-flash { 0%, 96% { opacity: 0; } 97% { opacity: .95; } 100% { opacity: 0; } }
${REDUCED_CSS}
`;

export default function TennisScene() {
  const reduce = useReducedMotion() ?? false;
  const [vi, setVi] = useState(0);
  const [cheer, setCheer] = useState(0);
  const [score, setScore] = useState<Score>({ pts: [0, 0], games: [0, 0] });
  const v = VENUES[vi];

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setVi((i) => (i + 1) % VENUES.length), VENUE_MS);
    return () => clearInterval(id);
  }, [reduce, vi]);

  const { players, rackets, ball, shadow } = useRally(reduce, (w) => {
    setCheer((c) => c + 1);
    setScore((s) => {
      const pts: [number, number] = [...s.pts];
      const games: [number, number] = [...s.games];
      if (pts[w] === 3) { games[w] = (games[w] + 1) % 7; pts[0] = 0; pts[1] = 0; } else pts[w]++;
      return { pts, games };
    });
  });

  return (
    <SceneFrame label={v.name} coords={v.coords}>
      <style>{CSS}</style>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <Crowd seats={v.seats} cheer={cheer} />
        <Court v={v} />
        <Net />
        <ellipse ref={shadow} rx="4" ry="2.6" fill="#000" opacity="0.3" />
        <PlayerFigure gref={players[0]} rref={rackets[0]} shirt="#1d4ed8" hair="#3b2a1f" />
        <PlayerFigure gref={players[1]} rref={rackets[1]} shirt="#f4f4f4" hair="#c76b2c" flip />
        <circle ref={ball} r="3.6" fill="#dfff3f" stroke="#6b7a12" strokeWidth="0.8" />
        {/* luz cenital suave */}
        <radialGradient id="tn-light" cx="50%" cy="50%" r="60%">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
        <rect width={W} height={H} fill="url(#tn-light)" pointerEvents="none" />
      </svg>

      {/* marcador */}
      <div className="label-mono absolute right-3 top-3 overflow-hidden rounded-md bg-black/70 text-[10px] text-white backdrop-blur-sm sm:right-4 sm:top-4">
        {[{ c: "#1d4ed8", n: "P1" }, { c: "#f4f4f4", n: "P2" }].map((p, i) => (
          <div key={p.n} className={cn("flex items-center gap-3 px-3 py-1", i === 0 && "border-b border-white/15")}>
            <span className="h-2 w-2 rounded-full" style={{ background: p.c }} />
            <span className="w-5">{p.n}</span>
            <span className="w-3 text-right text-white/70">{score.games[i]}</span>
            <span className="w-5 text-right text-signal">{POINTS[score.pts[i]]}</span>
          </div>
        ))}
      </div>

      {/* selector de sede */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
        {VENUES.map((x, i) => (
          <button
            key={x.key}
            onClick={() => setVi(i)}
            className={cn(
              "label-mono rounded-full px-3 py-1 text-[10px] backdrop-blur-sm transition-colors",
              i === vi ? "bg-white text-black" : "bg-black/45 text-white/80 hover:bg-black/65",
            )}
          >
            {x.key === "rg" ? "Roland-Garros" : x.key === "wim" ? "Wimbledon" : "US Open"}
          </button>
        ))}
      </div>
    </SceneFrame>
  );
}
