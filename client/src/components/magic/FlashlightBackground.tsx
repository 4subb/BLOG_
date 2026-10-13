import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FlashlightBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  glowSize?: number;
}

export function FlashlightBackground({
  className,
  imageUrl,
  glowSize = 400,
  ...props
}: FlashlightBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: -1000, y: -1000 }); // Move glow far away
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("absolute inset-0 z-0 h-full w-full overflow-hidden bg-black", className)}
      {...props}
    >
      {/* 1. Base Layer: Heavily Blurred and Darkened Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat blur-xl opacity-30 scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* 2. Sharp Reveal Layer: Only visible exactly where the cursor is */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat scale-110 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url(${imageUrl})`,
          WebkitMaskImage: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`,
        }}
      />

      {/* 3. Subtle overlay to ensure text remains readable */}
      <div className="absolute inset-0 pointer-events-none bg-background/60" />
    </div>
  );
}
