import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BounceCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
}

export function BounceCards({ images, className, ...props }: BounceCardsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const midIndex = Math.floor(images.length / 2);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center cursor-pointer w-full max-w-sm h-[300px] md:h-[400px] group perspective-[1000px]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {images.map((src, i) => {
        const offset = i - midIndex; // e.g., -1, 0, 1 for 3 images
        
        // When not hovered, tightly stacked with tiny rotations
        const idleRotate = offset * 4;
        const idleX = offset * 10;
        const idleZ = -Math.abs(offset) * 10;
        
        // When hovered, fanned out widely
        const activeRotate = offset * 15;
        const activeX = offset * 120; // Spread out horizontally
        const activeY = Math.abs(offset) * 20; // Dip the side cards slightly
        const activeZ = 0;

        return (
          <motion.div
            key={i}
            className="absolute w-[200px] h-[250px] md:w-[250px] md:h-[320px] rounded-2xl overflow-hidden shadow-2xl border-4 border-background"
            initial={false}
            animate={{
              rotateZ: isHovered ? activeRotate : idleRotate,
              x: isHovered ? activeX : idleX,
              y: isHovered ? activeY : 0,
              z: isHovered ? activeZ : idleZ,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              mass: 1,
            }}
            style={{
              zIndex: images.length - Math.abs(offset), // Center card is highest z-index
            }}
          >
            {/* Dark overlay when not hovered, reveals true color when fanned out */}
            <motion.div 
               className="absolute inset-0 bg-black z-10 mix-blend-overlay pointer-events-none"
               animate={{ opacity: isHovered ? 0 : 0.4 }}
            />
            <img 
               src={src} 
               alt={`Gallery image ${i + 1}`} 
               className="w-full h-full object-cover" 
               draggable={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
