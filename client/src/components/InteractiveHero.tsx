// client/src/components/InteractiveHero.tsx

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";

interface InteractiveHeroProps {
  backgroundImage: string;
}

export default function InteractiveHero({ backgroundImage }: InteractiveHeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 1. LOGICA DEL MOUSE (Parallax)
  // Guardamos la posición X e Y del mouse (0 a 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Suavizamos el movimiento para que no sea brusco (efecto "física")
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Calculamos el movimiento: El fondo se mueve un poco, el texto más
  const bgX = useTransform(smoothX, [-0.5, 0.5], ["-2%", "2%"]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], ["-2%", "2%"]);
  
  const textX = useTransform(smoothX, [-0.5, 0.5], ["2%", "-2%"]); // Se mueve al contrario
  const textY = useTransform(smoothY, [-0.5, 0.5], ["2%", "-2%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    
    // Calculamos la posición del mouse relativa al centro del div (-0.5 a 0.5)
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  // 2. LOGICA DEL SCROLL
  const { scrollY } = useScroll();
  // El texto se desvanece y sube un poco al hacer scroll hacia abajo
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textScrollY = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[500px] overflow-hidden flex items-center justify-center bg-black"
    >
      {/* CAPA 1: IMAGEN DE FONDO (Se mueve con el mouse) */}
      <motion.div
        style={{ x: bgX, y: bgY, scale: 1.1 }} // Scale 1.1 para evitar bordes blancos al mover
        className="absolute inset-0 z-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Gradiente oscuro para que el texto se lea bien */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-background" />
      </motion.div>

      {/* CAPA 2: TEXTO (Se mueve con el mouse Y con el scroll) */}
      <motion.div 
        style={{ x: textX, y: textY, opacity: textOpacity, translateY: textScrollY }}
        className="relative z-10 text-center px-4 max-w-4xl"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-heading font-bold text-white drop-shadow-lg tracking-tight"
        >
          Explorando <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Innovación</span>, <br />
          Deportes y Aventuras
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-200 mt-6 max-w-2xl mx-auto drop-shadow-md"
        >
          Un espacio dinámico donde la tecnología, la velocidad y la naturaleza convergen.
        </motion.p>
      </motion.div>

      {/* Indicador de Scroll animado */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Descubre</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }} 
          className="w-1 h-8 bg-gradient-to-b from-white to-transparent rounded-full"
        />
      </motion.div>
    </div>
  );
}