import React from "react";

interface SmartMediaProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
}

export const SmartMedia: React.FC<SmartMediaProps> = ({ 
  src, 
  alt = "Contenido multimedia", 
  className = "w-full h-auto rounded-lg shadow-md" 
}) => {
  if (!src) return <div className="bg-muted animate-pulse rounded-lg w-full h-48 flex items-center justify-center text-muted-foreground">Sin multimedia</div>;

  const baseUrl = import.meta.env.VITE_CDN_URL || "";
  const finalSrc = src.startsWith("http") ? src : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;

  const isVideo = finalSrc.match(/\.(mp4|webm|ogg)$/i);

  if (isVideo) {
    return (
      <video src={finalSrc} controls preload="metadata" playsInline className={className}>
        Tu navegador no soporta la reproducción de video.
      </video>
    );
  }

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      loading="lazy" 
      className={className} 
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Error+desde+Server";
      }}
    />
  );
};