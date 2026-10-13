import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DotFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  dotSize?: number;
  dotColor?: string;
  backgroundColor?: string;
  maskColor?: string;
}

export function DotField({
  className,
  dotSize = 1.5,
  dotColor = "rgba(0, 0, 0, 0.2)",
  backgroundColor = "transparent",
  maskColor = "black",
  ...props
}: DotFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("absolute inset-0 z-0 h-full w-full overflow-hidden", className)}
      {...props}
    >
      {/* Base Layer: Dark/Light background */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor }}
      />
      
      {/* Faded Dots Layer (always visible subtly) */}
      <div
        className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Glowing Overlay Dots Layer (revealed by mouse) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(circle, var(--primary) ${dotSize + 0.5}px, transparent ${dotSize + 0.5}px)`,
          backgroundSize: "24px 24px",
          WebkitMaskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${maskColor}, transparent)`,
          maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${maskColor}, transparent)`,
        }}
      />
    </div>
  );
}
