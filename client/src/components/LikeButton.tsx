// client/src/components/LikeButton.tsx

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion"; // ¡Para la animación!

interface LikeButtonProps {
  postId: string;
  initialCount?: number; // Opcional, por si ya lo tenemos
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { user, isAuthenticated } = useAuth();
  
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Cargar estado inicial (¿Cuántos likes? ¿Ya le di like?)
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Nota: Si el usuario no está logueado, la API devuelve userLiked: false, lo cual es correcto
        const res = await fetch(`http://localhost:5000/api/posts/${postId}/likes`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setLikesCount(data.count);
          setIsLiked(data.userLiked);
        }
      } catch (error) {
        console.error("Error cargando likes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
  }, [postId, user]); // Recargamos si cambia el post o el usuario se loguea

  // 2. Manejar el Clic
  const handleLike = async (e: React.MouseEvent) => {
    // ¡ESTAS DOS LÍNEAS SON LA CLAVE!
    e.preventDefault(); // Evita que el Link navegue
    e.stopPropagation(); // Evita que el clic suba a la tarjeta
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para dar Me Gusta");
      return;
    }

    // Optimistic Update (Actualizamos la UI antes de que responda el servidor)
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
    setIsAnimating(true); // Activar animación

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        // Si falla, revertimos los cambios
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
      } else {
        // (Opcional) Podríamos actualizar con el dato real del servidor
        const data = await res.json();
        setLikesCount(data.newCount);
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      // Revertir en error de red
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    }
    
    // Desactivar animación después de un momento
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (isLoading) return <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`group flex items-center gap-2 hover:bg-transparent ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
      onClick={handleLike}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          className={`h-6 w-6 transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} 
        />
      </motion.div>
      
      <span className={`text-sm font-semibold ${isLiked ? 'text-red-500' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {likesCount}
      </span>
    </Button>
  );
}