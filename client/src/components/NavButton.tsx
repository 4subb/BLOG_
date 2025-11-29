// client/src/components/NavButton.tsx

import { Link } from "wouter";
import { type Post } from "@shared/schema";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Usamos 'cn' para combinar clases condicionalmente

interface NavButtonProps {
  post?: Post; // El post al que enlaza (puede ser undefined)
  direction: "prev" | "next"; // La dirección del botón
}

export default function NavButton({ post, direction }: NavButtonProps) {
  const isPrev = direction === "prev";
  const isDisabled = !post;

  // Contenido interno (texto y flecha)
  const content = (
    <div className={cn(
      "relative z-20 flex flex-col h-full justify-center px-6 py-4 transition-transform duration-300",
      // Efecto hover sutil en el texto
      !isDisabled && (isPrev ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"),
      // Alineación del texto
      isPrev ? "items-start text-left" : "items-end text-right"
    )}>
      <div className="flex items-center text-sm text-white/80 mb-1 font-medium tracking-wider uppercase">
        {isPrev ? (
          <><ArrowLeft className="h-4 w-4 mr-2" /> Anterior</>
        ) : (
          <>Siguiente <ArrowRight className="h-4 w-4 ml-2" /></>
        )}
      </div>
      <div className="font-heading font-boldtext-lg md:text-xl text-white leading-tight line-clamp-2 drop-shadow-md">
        {isDisabled ? (isPrev ? "No hay posts anteriores" : "Es el último post") : post.title}
      </div>
    </div>
  );

  // Clases base para el contenedor del botón
  const containerClasses = cn(
    "relative group block w-full h-32 md:h-40 rounded-xl overflow-hidden border border-border/50 isolate",
    isDisabled ? "opacity-50 cursor-not-allowed grayscale" : "hover:border-primary/50 cursor-pointer shadow-sm hover:shadow-md transition-all"
  );

  // Si está desactivado, devolvemos un div simple
  if (isDisabled) {
    return (
      <div className={containerClasses}>
        {/* Fondo gris de placeholder */}
        <div className="absolute inset-0 bg-muted/20 z-0" />
        {content}
      </div>
    );
  }

  // Si está activo, devolvemos un Link con la imagen y los efectos
  return (
    <Link href={`/post/${post.id}`}>
      <a className={containerClasses}>
        {/* CAPA 1: Imagen de fondo */}
        {post.imageUrl && (
          <div 
            className={cn(
              "absolute inset-0 z-0 bg-cover transition-transform duration-700 group-hover:scale-105",
              // Alineación de la imagen según la dirección
              isPrev ? "bg-right" : "bg-left"
            )}
            style={{ backgroundImage: `url(${post.imageUrl})` }}
          />
        )}

        {/* CAPA 2: Gradiente de desvanecimiento (Fade) */}
        {/* Esto crea la transición suave entre la imagen y el color sólido */}
        <div 
          className={cn(
            "absolute inset-0 z-10",
            isPrev 
              // Prev: Desvanece de negro (izquierda) a transparente (derecha)
              ? "bg-gradient-to-r from-black/90 via-black/60 to-transparent"
              // Next: Desvanece de transparente (izquierda) a negro (derecha)
              : "bg-gradient-to-l from-black/90 via-black/60 to-transparent"
          )}
        />
        
        {/* CAPA 3: Superposición oscura general para asegurar legibilidad */}
        <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-black/30 transition-colors" />

        {/* CAPA 4: El contenido de texto (definido arriba) */}
        {content}
      </a>
    </Link>
  );
}