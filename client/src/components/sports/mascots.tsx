import type { SportKey } from "./media";
import F1Scene from "./scenes/F1Scene";
import CyclingScene from "./scenes/CyclingScene";
import TennisScene from "./scenes/TennisScene";

/*
 * Escena animada al pie del hero de cada deporte:
 *  · F1: Suzuka (trazado en ocho, Fuji, cerezos) con monoplazas de varios equipos en la recta.
 *  · Ciclismo: Alpes suizos con lago y puerto; corredores sobre bicis de gama WorldTour.
 *  · Tenis: vista cenital de una pista central (RG / Wimbledon / US Open) con peloteo y grada llena.
 */
export default function SportMascot({ sport }: { sport: SportKey; accent?: string }) {
  if (sport === "f1") return <F1Scene />;
  if (sport === "ciclismo") return <CyclingScene />;
  return <TennisScene />;
}
