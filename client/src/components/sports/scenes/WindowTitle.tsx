import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sized, type Photo } from "../media";

// Guardado para reutilizar: titular-ventana con fotos desenfocadas (no se usa ahora mismo).
const ROTATE_MS = 5000;

/* ───────────── Titular-ventana ─────────────
 * SVG en vez de background-clip:text: así la foto se puede desenfocar y desaturar (filtro sobre la
 * imagen) sin que se emborronen los bordes de las letras. El viewBox se ajusta al ancho real del
 * texto medido con getBBox, de modo que la palabra llena el ancho disponible.
 */
const TITLE_FONT = "'Big Shoulders Display', 'Archivo', system-ui, sans-serif";
const FS = 200; // tamaño de fuente en unidades del viewBox
const TOP = -1.0 * FS; // deja sitio a tildes (FÓRMULA)
const HEIGHT = 1.03 * FS;

export default function WindowTitle({ text, photos, active, reduce }: { text: string; photos: Photo[]; active: number; reduce: boolean }) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGTextElement>(null);
  const [box, setBox] = useState({ x: 0, w: text.length * FS * 0.5 });

  useLayoutEffect(() => {
    let alive = true;
    const measure = () => {
      const b = ref.current?.getBBox();
      if (alive && b && b.width > 0) setBox({ x: b.x, w: b.width });
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => { alive = false; };
  }, [text]);

  const { x, w } = box;
  // La imagen sobra por los lados para poder hacer el paneo lento
  const imgW = w * 1.25;
  const textProps = {
    x: 0, y: 0, fontSize: FS, fontFamily: TITLE_FONT, fontWeight: 900, letterSpacing: FS * 0.012,
  } as const;

  return (
    <svg
      viewBox={`${x} ${TOP} ${w} ${HEIGHT}`}
      preserveAspectRatio="xMinYMid meet"
      className="block h-auto max-h-[17rem] w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <text {...textProps}>{text}</text>
        </clipPath>
        <filter id={`soft-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={FS * 0.022} />
          <feColorMatrix type="saturate" values="0.7" />
        </filter>
      </defs>

      {/* Base visible mientras cargan las fotos */}
      <text ref={ref} {...textProps} fill="hsl(var(--foreground) / 0.08)">{text}</text>

      <g clipPath={`url(#clip-${uid})`}>
        {photos.map((p, i) => (
          <motion.image
            key={p.src}
            href={sized(p, 1280)}
            y={TOP}
            width={imgW}
            height={HEIGHT}
            preserveAspectRatio="xMidYMid slice"
            filter={`url(#soft-${uid})`}
            initial={false}
            animate={{
              opacity: i === active ? 1 : 0,
              x: reduce ? x - (imgW - w) / 2 : i === active ? [x - (imgW - w), x] : x - (imgW - w),
            }}
            transition={{
              opacity: { duration: 1.1, ease: "easeInOut" },
              x: { duration: ROTATE_MS / 1000 + 1.2, ease: "linear" },
            }}
          />
        ))}
        {/* Velo del color de fondo: baja el contraste de la foto con la interfaz */}
        <rect x={x} y={TOP} width={w} height={HEIGHT} fill="hsl(var(--background))" opacity="0.22" />
      </g>

      {/* Contorno fino */}
      <text {...textProps} fill="none" stroke="hsl(var(--foreground) / 0.25)" strokeWidth={FS * 0.006}>{text}</text>
    </svg>
  );
}
