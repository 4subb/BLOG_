import { cn } from "@/lib/utils";

/*
 * Banderas simplificadas en SVG (sin imágenes externas). Son la única excepción a la regla de
 * "solo tokens" junto con las libreas de los equipos: dentro de las ilustraciones cartoon, los
 * colores nacionales son contenido, no decoración de la interfaz.
 */
type Stripes = { dir: "v" | "h"; colors: string[] };
type FlagDef = Stripes | { custom: "japan" | "nordic" | "uk" | "usa" | "brazil" | "canada" | "china" | "australia"; colors: string[] };

const FLAGS: Record<string, FlagDef> = {
  italy: { dir: "v", colors: ["#009246", "#ffffff", "#ce2b37"] },
  france: { dir: "v", colors: ["#002395", "#ffffff", "#ed2939"] },
  belgium: { dir: "v", colors: ["#000000", "#fdda24", "#ef3340"] },
  mexico: { dir: "v", colors: ["#006847", "#ffffff", "#ce1126"] },
  ireland: { dir: "v", colors: ["#169b62", "#ffffff", "#ff883e"] },
  netherlands: { dir: "h", colors: ["#ae1c28", "#ffffff", "#21468b"] },
  germany: { dir: "h", colors: ["#000000", "#dd0000", "#ffce00"] },
  spain: { dir: "h", colors: ["#aa151b", "#f1bf00", "#f1bf00", "#aa151b"] },
  monaco: { dir: "h", colors: ["#ce1126", "#ffffff"] },
  poland: { dir: "h", colors: ["#ffffff", "#dc143c"] },
  austria: { dir: "h", colors: ["#ed2939", "#ffffff", "#ed2939"] },
  russia: { dir: "h", colors: ["#ffffff", "#0039a6", "#d52b1e"] },
  slovenia: { dir: "h", colors: ["#ffffff", "#0000ff", "#ff0000"] },
  colombia: { dir: "h", colors: ["#fcd116", "#fcd116", "#003893", "#ce1126"] },
  ecuador: { dir: "h", colors: ["#ffdd00", "#ffdd00", "#034ea2", "#ed1c24"] },
  argentina: { dir: "h", colors: ["#74acdf", "#ffffff", "#74acdf"] },
  thailand: { dir: "h", colors: ["#a51931", "#f4f5f8", "#2d2a4a", "#2d2a4a", "#f4f5f8", "#a51931"] },
  belarus: { dir: "h", colors: ["#c8313e", "#c8313e", "#4aa657"] },
  kazakhstan: { dir: "h", colors: ["#00afca"] },
  newzealand: { dir: "h", colors: ["#012169"] },
  japan: { custom: "japan", colors: ["#ffffff", "#bc002d"] },
  denmark: { custom: "nordic", colors: ["#c8102e", "#ffffff"] },
  finland: { custom: "nordic", colors: ["#ffffff", "#002f6c"] },
  norway: { custom: "nordic", colors: ["#ba0c2f", "#00205b"] },
  sweden: { custom: "nordic", colors: ["#006aa7", "#fecc00"] },
  uk: { custom: "uk", colors: ["#012169", "#ffffff", "#c8102e"] },
  usa: { custom: "usa", colors: ["#b22234", "#ffffff", "#3c3b6e"] },
  brazil: { custom: "brazil", colors: ["#009c3b", "#ffdf00", "#002776"] },
  canada: { custom: "canada", colors: ["#ff0000", "#ffffff"] },
  china: { custom: "china", colors: ["#de2910", "#ffde00"] },
  australia: { custom: "australia", colors: ["#012169", "#ffffff"] },
};

// Gentilicios (API de F1, en inglés) y países (en inglés o español) → clave de bandera
const ALIASES: Record<string, string> = {
  italian: "italy", italia: "italy", french: "france", francia: "france", belgian: "belgium", bélgica: "belgium",
  mexican: "mexico", méxico: "mexico", irish: "ireland", dutch: "netherlands", "países bajos": "netherlands",
  german: "germany", alemania: "germany", spanish: "spain", españa: "spain", monegasque: "monaco", mónaco: "monaco",
  polish: "poland", polonia: "poland", austrian: "austria", russian: "russia", rusia: "russia",
  slovenian: "slovenia", eslovenia: "slovenia", colombian: "colombia", ecuadorian: "ecuador",
  argentine: "argentina", argentinian: "argentina", thai: "thailand", tailandia: "thailand",
  belarusian: "belarus", bielorrusia: "belarus", kazakh: "kazakhstan", kazajistán: "kazakhstan",
  "new zealander": "newzealand", "new zealand": "newzealand", "nueva zelanda": "newzealand",
  japanese: "japan", japón: "japan", danish: "denmark", dinamarca: "denmark", finnish: "finland",
  finlandia: "finland", norwegian: "norway", noruega: "norway", swedish: "sweden", suecia: "sweden",
  british: "uk", "united kingdom": "uk", "reino unido": "uk", great_britain: "uk",
  american: "usa", "united states": "usa", "estados unidos": "usa",
  brazilian: "brazil", brasil: "brazil", canadian: "canada", chinese: "china",
  australian: "australia", qatar: "qatar", azerbaijan: "azerbaijan", "saudi arabia": "saudi", uae: "uae",
  singapore: "singapore", hungary: "hungary", hungarian: "hungary", malaysia: "malaysia", bahrain: "bahrain",
};
Object.assign(FLAGS, {
  qatar: { dir: "v", colors: ["#ffffff", "#8a1538", "#8a1538", "#8a1538"] },
  azerbaijan: { dir: "h", colors: ["#00b5e2", "#ef3340", "#509e2f"] },
  saudi: { dir: "h", colors: ["#006c35"] },
  uae: { dir: "h", colors: ["#00732f", "#ffffff", "#000000"] },
  singapore: { dir: "h", colors: ["#ef3340", "#ffffff"] },
  hungary: { dir: "h", colors: ["#ce2939", "#ffffff", "#477050"] },
  malaysia: { dir: "h", colors: ["#cc0001", "#ffffff", "#cc0001", "#ffffff", "#cc0001", "#ffffff", "#cc0001"] },
  bahrain: { dir: "v", colors: ["#ffffff", "#ce1126", "#ce1126", "#ce1126"] },
} satisfies Record<string, FlagDef>);

export function flagKey(nationalityOrCountry?: string | null): string | null {
  if (!nationalityOrCountry) return null;
  const k = nationalityOrCountry.trim().toLowerCase();
  return FLAGS[k] ? k : ALIASES[k] ?? null;
}

export function flagColors(nationalityOrCountry?: string | null): string[] | null {
  const key = flagKey(nationalityOrCountry);
  return key ? FLAGS[key].colors : null;
}

/** Escudo simplificado: águila (café) sobre nopal (verde), legible incluso a 16px. */
function MexicoEmblem() {
  return (
    <g>
      <path d="M12.2 12.6 Q15 14.6 17.8 12.6" fill="none" stroke="#4c7a34" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="15" cy="9.6" rx="2.3" ry="2.6" fill="#8c5a2b" />
      <circle cx="15.9" cy="7.4" r="0.9" fill="#8c5a2b" />
      <path d="M13 9.2 L11.6 7.4 M17 9.2 L18.4 7.4" stroke="#8c5a2b" strokeWidth="0.9" strokeLinecap="round" />
    </g>
  );
}

/** Contenido de la bandera para un rectángulo de 30×20 (se puede incrustar en otro SVG). */
export function FlagShapes({ code }: { code: string }) {
  const def = FLAGS[code];
  if (!def) return <rect width="30" height="20" fill="hsl(var(--muted))" />;
  if ("dir" in def) {
    const n = def.colors.length;
    return (
      <>
        {def.colors.map((c, i) =>
          def.dir === "v"
            ? <rect key={i} x={(30 / n) * i} width={30 / n + 0.05} height="20" fill={c} />
            : <rect key={i} y={(20 / n) * i} width="30" height={20 / n + 0.05} fill={c} />,
        )}
        {/* México lleva el escudo en la franja blanca: sin él se confunde con Italia */}
        {code === "mexico" && <MexicoEmblem />}
      </>
    );
  }
  const [a, b, c] = def.colors;
  switch (def.custom) {
    case "japan": return <><rect width="30" height="20" fill={a} /><circle cx="15" cy="10" r="6" fill={b} /></>;
    case "nordic": return <><rect width="30" height="20" fill={a} /><rect x="8" width="4" height="20" fill={b} /><rect y="8" width="30" height="4" fill={b} /></>;
    case "uk": return (
      <>
        <rect width="30" height="20" fill={a} />
        <path d="M0 0L30 20M30 0L0 20" stroke={b} strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke={c} strokeWidth="1.4" />
        <path d="M15 0V20M0 10H30" stroke={b} strokeWidth="6" />
        <path d="M15 0V20M0 10H30" stroke={c} strokeWidth="3.4" />
      </>
    );
    case "usa": return (
      <>
        <rect width="30" height="20" fill={b} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} y={(20 / 13) * i * 2} width="30" height={20 / 13} fill={a} />)}
        <rect width="13" height={(20 / 13) * 7} fill={c} />
      </>
    );
    case "brazil": return <><rect width="30" height="20" fill={a} /><path d="M15 2L28 10L15 18L2 10Z" fill={b} /><circle cx="15" cy="10" r="4.2" fill={c} /></>;
    case "canada": return <><rect width="30" height="20" fill={b} /><rect width="7.5" height="20" fill={a} /><rect x="22.5" width="7.5" height="20" fill={a} /><path d="M15 4L17 9L20 8L18 13H12L10 8L13 9Z" fill={a} /></>;
    case "china": return <><rect width="30" height="20" fill={a} /><path d="M6 3L7.2 6.6H11L8 8.8L9.1 12.4L6 10.2L2.9 12.4L4 8.8L1 6.6H4.8Z" fill={b} /></>;
    case "australia": return (
      <>
        <rect width="30" height="20" fill={a} />
        <path d="M7.5 0V10M0 5H15" stroke={b} strokeWidth="2.4" />
        {[[22, 4], [25, 9], [21, 15], [18, 10], [8, 15]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 4 ? 1.8 : 1.1} fill={b} />)}
      </>
    );
  }
}

/** Bandera rectangular en línea, p. ej. junto a un nombre. */
export function Flag({ of, className, title }: { of?: string | null; className?: string; title?: string }) {
  const code = flagKey(of);
  return (
    <svg viewBox="0 0 30 20" className={cn("inline-block h-[0.8em] w-[1.2em] shrink-0 rounded-[1px] align-[-0.06em] ring-1 ring-rock/40", className)} role="img" aria-label={title ?? of ?? ""}>
      {code ? <FlagShapes code={code} /> : <rect width="30" height="20" fill="hsl(var(--muted))" />}
    </svg>
  );
}
