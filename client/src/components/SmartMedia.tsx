import React from "react";
import { useLang } from "@/lib/lang";

interface SmartMediaProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager"; // eager para imágenes de portada (visibles al cargar)
}

export const SmartMedia: React.FC<SmartMediaProps> = ({ 
  src, 
  alt, 
  className = "w-full h-auto rounded-lg shadow-md",
  loading = "lazy",
}) => {
  const { L } = useLang();
  if (!src) return <div className="bg-muted animate-pulse rounded-lg w-full h-48 flex items-center justify-center text-muted-foreground">{L("Sin multimedia", "No media")}</div>;

  const baseUrl = import.meta.env.VITE_CDN_URL || "";
  // URLs absolutas, data: y las que sirve este mismo servidor (/api/media/...) van tal cual;
  // solo las rutas de archivos sueltos se resuelven contra la CDN
  const isOwnOrAbsolute = /^(https?:|data:|\/api\/)/.test(src);
  const finalSrc = isOwnOrAbsolute ? src : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;

  const isVideo = finalSrc.match(/\.(mp4|webm|ogg)$/i);

  if (isVideo) {
    return (
      <video src={finalSrc} controls preload="metadata" playsInline className={className}>
        {L("Tu navegador no soporta la reproducción de video.", "Your browser does not support video playback.")}
      </video>
    );
  }

  return (
    <img 
      src={finalSrc} 
      alt={alt ?? ""} 
      loading={loading}
      className={className} 
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+desde+Server";
      }}
    />
  );
};