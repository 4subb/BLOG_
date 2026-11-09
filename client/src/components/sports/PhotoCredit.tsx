import { cn } from "@/lib/utils";
import type { Photo } from "./media";
import { useLang } from "@/lib/lang";

/** Crédito obligatorio de las fotos CC: autor · licencia, enlazado a la ficha en Commons. */
export default function PhotoCredit({ photo, className }: { photo: Photo; className?: string }) {
  const { L } = useLang();
  return (
    <a
      href={photo.page}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("label-mono inline-block max-w-full truncate text-muted-foreground/80 transition-colors hover:text-signal", className)}
      title={photo.title}
    >
      {L("Foto", "Photo")} · {photo.author} · {photo.license} · Wikimedia Commons
    </a>
  );
}
