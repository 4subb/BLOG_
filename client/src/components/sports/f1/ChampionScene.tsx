import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { FlagShapes, flagColors, flagKey } from "@/components/sports/Flag";
import { teamColor } from "./teams";
import { useLang } from "@/lib/lang";

/*
 * Escena cartoon del campeón (o del líder si el título sigue abierto).
 * Secuencia: el auto entra derrapando → el piloto salta del cockpit al podio → levanta el trofeo
 * → confeti con los colores de su bandera y salto de alegría en bucle.
 * Ilustración original y estilizada (casco con visera, sin rasgos): nada de parecidos fotográficos.
 */

const GROUND = 270;
const CAR_STOP = 215;          // x donde frena el auto
const COCKPIT = { x: 150, y: -50 }; // posición del casco respecto al auto
const PODIUM_X = 610;
const PODIUM_H = 42;
const T = { carIn: 1.7, hopStart: 1.9, hopEnd: 2.7, grab: 2.9, party: 3.1 };

const INK = "hsl(var(--foreground))";
const PAPER = "hsl(var(--background))";
const GOLD = "#f4c430";

interface Props {
  number: string;
  teamId: string;
  nationality: string;
  mode: "champion" | "leader";
}

export default function ChampionScene({ number, teamId, nationality, mode }: Props) {
  const reduce = useReducedMotion() ?? false;
  const [take, setTake] = useState(0);
  const { L } = useLang();
  const livery = teamColor(teamId);
  const flag = flagKey(nationality);
  const confetti = flagColors(nationality) ?? [GOLD, "hsl(var(--signal))", INK];

  return (
    <div className="relative">
      <svg viewBox="0 0 800 320" className="h-auto w-full" role="img" aria-label={mode === "champion" ? L("Animación: el campeón llega al trofeo y celebra", "Animation: the champion reaches the trophy and celebrates") : L("Animación: el líder del campeonato en pista", "Animation: the championship leader on track")}>
        <defs>
          <pattern id="checker" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill={PAPER} />
            <rect width="6" height="6" fill={INK} />
            <rect x="6" y="6" width="6" height="6" fill={INK} />
          </pattern>
        </defs>

        {/* Pista: línea de suelo, marcas de carril y línea de meta a cuadros */}
        <line x1="0" y1={GROUND + 18} x2="800" y2={GROUND + 18} stroke="hsl(var(--rock))" strokeWidth="1.5" />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={i * 60 + 10} y={GROUND + 28} width="28" height="3" rx="1.5" fill="hsl(var(--rock))" opacity="0.6" />
        ))}
        <rect x="500" y={GROUND - 2} width="14" height="20" fill="url(#checker)" stroke={INK} strokeWidth="1" />

        <g key={take}>
          {mode === "champion" ? (
            <>
              <Podium />
              {/* Trofeo sobre el podio hasta que el piloto lo levanta */}
              <g transform={`translate(${PODIUM_X} ${GROUND - PODIUM_H})`}>
                <motion.g
                  initial={{ opacity: 1 }}
                  animate={{ opacity: reduce ? 0 : [1, 1, 0] }}
                  transition={{ duration: T.grab, times: [0, 0.97, 1] }}
                >
                  <Trophy />
                </motion.g>
              </g>

              <FlagPole flag={flag} reduce={reduce} />

              <Car number={number} livery={livery} flag={flag} reduce={reduce} driverInside={false} />
              <Driver livery={livery} flag={flag} reduce={reduce} />
              {!reduce && <Confetti colors={confetti} />}
            </>
          ) : (
            <>
              <Podium />
              <g transform={`translate(${PODIUM_X} ${GROUND - PODIUM_H})`}>
                <Trophy />
                <motion.text
                  x="0" y="-62" textAnchor="middle" className="font-display" fontSize="26" fill="hsl(var(--signal))"
                  animate={reduce ? undefined : { y: [-62, -70, -62] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  ?
                </motion.text>
              </g>
              <Car number={number} livery={livery} flag={flag} reduce={reduce} driverInside loop />
            </>
          )}
        </g>
      </svg>

      {!reduce && (
        <button
          type="button"
          onClick={() => setTake((t) => t + 1)}
          className="label-mono absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-rock/50 bg-background/70 px-3 py-1.5 text-muted-foreground backdrop-blur transition-colors hover:border-signal hover:text-signal"
        >
          <RotateCcw className="h-3 w-3" /> {L("Repetir", "Replay")}
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Piezas ───────────────────────── */

function Podium() {
  return (
    <g transform={`translate(${PODIUM_X} ${GROUND + 18})`}>
      <rect x="-52" y={-PODIUM_H - 18} width="104" height={PODIUM_H + 18} rx="3" fill="hsl(var(--muted))" stroke={INK} strokeWidth="2.5" />
      <text x="0" y="-12" textAnchor="middle" className="font-display" fontSize="30" fill={INK}>1</text>
    </g>
  );
}

export function Trophy() {
  return (
    <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
      <rect x="-15" y="-9" width="30" height="9" rx="2" fill={INK} />
      <rect x="-4" y="-21" width="8" height="12" fill={GOLD} />
      <path d="M-11 -46 C -24 -46 -24 -30 -10 -30" fill="none" />
      <path d="M11 -46 C 24 -46 24 -30 10 -30" fill="none" />
      <path d="M-17 -50 H17 Q17 -21 0 -21 Q-17 -21 -17 -50 Z" fill={GOLD} />
      <path d="M-9 -44 Q-9 -32 -2 -28" fill="none" stroke={PAPER} strokeWidth="2" opacity="0.7" />
    </g>
  );
}

function Helmet({ livery, flag }: { livery: string; flag: string | null }) {
  const colors = flag ? flagColors(flag) : null;
  return (
    <g>
      <circle r="13" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      {/* franja con los colores de la bandera */}
      {colors && (
        <g clipPath="url(#helmetClip)">
          {colors.slice(0, 3).map((c, i) => <rect key={i} x={-13 + i * 5} y="-14" width="5" height="10" fill={c} />)}
        </g>
      )}
      <path d="M-13 -2 H13" stroke={livery} strokeWidth="3" />
      <rect x="1" y="-6" width="13" height="7" rx="3.5" fill={INK} />
      <rect x="4" y="-4.5" width="5" height="2" rx="1" fill={PAPER} opacity="0.6" />
      <clipPath id="helmetClip"><circle r="11.5" /></clipPath>
    </g>
  );
}

function Wheel({ cx, reduce, spin }: { cx: number; reduce: boolean; spin: "in" | "loop" | "none" }) {
  const rotate = spin === "loop" ? { rotate: 360 } : spin === "in" ? { rotate: [0, 1080, 1140] } : undefined;
  const transition = spin === "loop"
    ? { duration: 0.35, repeat: Infinity, ease: "linear" as const }
    : { duration: T.carIn + 0.2, times: [0, 0.85, 1], ease: "easeOut" as const };
  return (
    <g transform={`translate(${cx} -16)`}>
      <circle r="18" fill={INK} />
      <circle r="9" fill="hsl(var(--muted))" />
      <motion.g animate={reduce ? undefined : rotate} transition={transition} style={{ originX: "0px", originY: "0px" }}>
        <path d="M0 -8V8M-8 0H8" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
    </g>
  );
}

function Car({ number, livery, flag, reduce, driverInside, loop = false }: {
  number: string; livery: string; flag: string | null; reduce: boolean; driverInside: boolean; loop?: boolean;
}) {
  const x = loop
    ? { x: [-280, 820] }
    : { x: [-280, CAR_STOP + 18, CAR_STOP] };
  const transition = loop
    ? { duration: 3.6, repeat: Infinity, ease: "linear" as const, repeatDelay: 0.6 }
    : { duration: T.carIn, times: [0, 0.82, 1], ease: "easeOut" as const };

  return (
    <motion.g
      initial={reduce ? { x: loop ? 260 : CAR_STOP } : { x: -280 }}
      animate={reduce ? undefined : x}
      transition={transition}
    >
      <g transform={`translate(0 ${GROUND})`}>
        {/* Rebote de suspensión al frenar */}
        <motion.g
          animate={reduce || loop ? undefined : { y: [0, 0, -5, 2, 0] }}
          transition={{ duration: T.carIn + 0.4, times: [0, 0.7, 0.82, 0.92, 1] }}
        >
          {/* líneas de velocidad */}
          {!reduce && (
            <motion.g
              stroke="hsl(var(--rock))" strokeWidth="3" strokeLinecap="round"
              animate={{ opacity: loop ? 1 : [1, 1, 0] }}
              transition={{ duration: T.carIn, times: [0, 0.75, 0.9] }}
            >
              <line x1="-70" y1="-42" x2="-20" y2="-42" />
              <line x1="-90" y1="-28" x2="-30" y2="-28" />
              <line x1="-60" y1="-14" x2="-25" y2="-14" />
            </motion.g>
          )}

          <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            {/* alerón trasero */}
            <rect x="6" y="-70" width="10" height="40" fill={INK} />
            <rect x="-4" y="-78" width="34" height="10" rx="2" fill={livery} />
            {/* carrocería */}
            <path d="M10 -16 L14 -36 Q60 -40 110 -40 L134 -54 Q160 -58 176 -46 L196 -34 Q230 -30 248 -22 L250 -14 Q200 -10 10 -10 Z" fill={livery} />
            {/* pontón */}
            <path d="M64 -32 Q100 -36 128 -34 L132 -20 Q96 -18 64 -20 Z" fill={PAPER} opacity="0.35" stroke="none" />
            {/* halo */}
            <path d="M136 -54 Q156 -76 182 -50" fill="none" strokeWidth="4" />
            {/* alerón delantero */}
            <rect x="228" y="-12" width="38" height="7" rx="2" fill={livery} />
          </g>

          {/* dorsal */}
          <g transform="translate(92 -26)">
            <circle r="11" fill={PAPER} stroke={INK} strokeWidth="2" />
            <text y="4.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={INK} className="font-mono">{number}</text>
          </g>

          {/* piloto en el cockpit (si va dentro) */}
          {driverInside && (
            <g transform={`translate(${COCKPIT.x} ${COCKPIT.y})`}>
              <Helmet livery={livery} flag={flag} />
            </g>
          )}

          <Wheel cx={46} reduce={reduce} spin={loop ? "loop" : "in"} />
          <Wheel cx={204} reduce={reduce} spin={loop ? "loop" : "in"} />
        </motion.g>
      </g>
    </motion.g>
  );
}

function Driver({ livery, flag, reduce }: { livery: string; flag: string | null; reduce: boolean }) {
  // Del cockpit (auto detenido) a lo alto del podio con un salto en arco
  const fromX = CAR_STOP + COCKPIT.x;
  const fromY = GROUND + COCKPIT.y + 62; // pies del muñeco: el casco queda a -62
  const toY = GROUND + 18 - PODIUM_H - 18;
  const arc = { x: [fromX, fromX, (fromX + PODIUM_X) / 2, PODIUM_X], y: [fromY, fromY - 10, fromY - 120, toY] };

  return (
    <motion.g
      initial={reduce ? { x: PODIUM_X, y: toY } : { x: fromX, y: fromY, opacity: 0 }}
      animate={reduce ? undefined : { ...arc, opacity: [0, 1, 1, 1] }}
      transition={{ delay: T.hopStart, duration: T.hopEnd - T.hopStart, times: [0, 0.15, 0.55, 1], ease: "easeInOut" }}
    >
      {/* salto de alegría en bucle */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -30, 0] }}
        transition={{ delay: T.party, duration: 0.62, repeat: Infinity, ease: [0.33, 0, 0.67, 1], repeatDelay: 0.08 }}
      >
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          {/* piernas */}
          <line x1="-6" y1="0" x2="-6" y2="-22" />
          <line x1="6" y1="0" x2="6" y2="-22" />
          {/* brazos arriba */}
          <line x1="-10" y1="-42" x2="-19" y2="-74" />
          <line x1="10" y1="-42" x2="19" y2="-74" />
        </g>
        {/* mono del equipo */}
        <rect x="-13" y="-50" width="26" height="31" rx="9" fill={livery} stroke={INK} strokeWidth="2.5" />
        <g transform="translate(0 -62)"><Helmet livery={livery} flag={flag} /></g>

        {/* trofeo en alto (g exterior posiciona; framer-motion sobrescribe el transform del motion.g) */}
        <g transform="translate(0 -76)">
          <motion.g
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.6 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: T.grab, duration: 0.3, ease: "backOut" }}
            style={{ originX: "0px", originY: "0px" }}
          >
            <Trophy />
          </motion.g>
        </g>
      </motion.g>
    </motion.g>
  );
}

function FlagPole({ flag, reduce }: { flag: string | null; reduce: boolean }) {
  return (
    <g transform={`translate(720 ${GROUND + 18})`}>
      <line x1="0" y1="0" x2="0" y2="-190" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="-192" r="4" fill={GOLD} stroke={INK} strokeWidth="2" />
      {/* se iza al levantar el trofeo y ondea */}
      <motion.g
        initial={{ y: reduce ? -186 : -40 }}
        animate={reduce ? undefined : { y: -186 }}
        transition={{ delay: T.grab, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.g
          animate={reduce ? undefined : { skewY: [0, 5, 0, -4, 0], scaleX: [1, 0.96, 1, 0.97, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "0px", originY: "0px" }}
        >
          <g transform="translate(2 0) scale(2.2)">
            {flag ? <FlagShapes code={flag} /> : <rect width="30" height="20" fill="hsl(var(--signal))" />}
            <rect width="30" height="20" fill="none" stroke={INK} strokeWidth="1" />
          </g>
        </motion.g>
      </motion.g>
    </g>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  // Determinista (sin Math.random) para que cada repetición se vea igual
  const pieces = Array.from({ length: 34 }, (_, i) => {
    const spread = ((i * 47) % 100) / 100 - 0.5;    // -0.5..0.5
    const lift = ((i * 29) % 100) / 100;            // 0..1
    return {
      dx: spread * 520,
      peak: -120 - lift * 90,
      fall: 120 + ((i * 13) % 60),
      rot: ((i * 73) % 360) * (i % 2 ? 1 : -1),
      delay: T.grab + (i % 6) * 0.04,
      color: colors[i % colors.length],
      w: 6 + (i % 3) * 2,
    };
  });
  return (
    <g transform={`translate(${PODIUM_X} ${GROUND - 110})`}>
      {pieces.map((p, i) => (
        <motion.rect
          key={i}
          width={p.w}
          height={p.w * 0.55}
          rx="1"
          fill={p.color}
          stroke={INK}
          strokeWidth="0.8"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{ x: [0, p.dx * 0.6, p.dx], y: [0, p.peak, p.fall], rotate: [0, p.rot, p.rot * 2], opacity: [0, 1, 1, 0] }}
          transition={{
            default: { delay: p.delay, duration: 2.4, times: [0, 0.35, 1], ease: "easeOut", repeat: Infinity, repeatDelay: 1.2 },
            opacity: { delay: p.delay, duration: 2.4, times: [0, 0.1, 0.8, 1], repeat: Infinity, repeatDelay: 1.2 },
          }}
        />
      ))}
    </g>
  );
}
