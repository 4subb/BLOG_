import { motion } from "framer-motion";
import { formatKg } from "@shared/gym";
import { useLang } from "@/lib/lang";

// Discos por lado en barra olímpica de 20 kg
export function platesPerSide(total: number, bar = 20) {
  let side = (total - bar) / 2;
  const out: number[] = [];
  for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (side >= p - 1e-9) { out.push(p); side -= p; }
  return out;
}

// Alto del disco según su peso; el de 25 lleva el acento naranja (paleta Mission Control)
const plateH = (p: number) => (p >= 20 ? 44 : p >= 15 ? 38 : p >= 10 ? 32 : p >= 5 ? 24 : 16);
const plateCls = (p: number) => (p === 25 ? "bg-signal" : p >= 15 ? "bg-foreground" : p >= 5 ? "bg-foreground/60" : "bg-rock");

export default function Barbell({ weight }: { weight: number }) {
  const { L } = useLang();
  const plates = platesPerSide(weight);
  const Side = ({ dir }: { dir: 1 | -1 }) => (
    <div className={`flex items-center gap-[2px] ${dir === -1 ? "flex-row-reverse" : ""}`}>
      {plates.map((p, i) => (
        <motion.div
          key={i}
          className={`w-[7px] rounded-[2px] ${plateCls(p)}`}
          style={{ height: plateH(p) }}
          initial={{ opacity: 0, x: dir * 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i, type: "spring", stiffness: 380, damping: 24 }}
          title={`${formatKg(p)} kg`}
        />
      ))}
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-12 items-center">
        <Side dir={-1} />
        <div className="h-2 w-5 bg-rock" />
        <div className="h-1.5 w-24 bg-foreground/70 sm:w-32" />
        <div className="h-2 w-5 bg-rock" />
        <Side dir={1} />
      </div>
      <p className="label-mono text-muted-foreground">
        {plates.length ? `${plates.map(formatKg).join(" + ")} ${L("por lado", "per side")}` : L("solo barra", "empty bar")}
      </p>
    </div>
  );
}
