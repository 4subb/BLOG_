import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BorderGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  borderWidth?: number;
}

export function BorderGlowCard({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  borderWidth = 2,
  ...props
}: BorderGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset to hide glow when not hovering
    setMousePosition({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-xl bg-card p-6 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {/* The Glow Border Layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-xl transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      
      {/* Inner Mask (creates the border effect by covering the center) */}
      <div
        className="pointer-events-none absolute z-0 rounded-xl bg-card"
        style={{
          top: borderWidth,
          left: borderWidth,
          right: borderWidth,
          bottom: borderWidth,
        }}
      />
      
      {/* Static fallback border */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-xl border border-border" />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
