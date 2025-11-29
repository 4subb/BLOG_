import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton"; // Asegúrate de que este archivo exista

interface PostCardProps {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  country?: string | null;
  content?: string; 
  createdAt?: Date;
  date?: string;
  excerpt?: string;
  tags?: string[] | null;
  className?: string;
  [key: string]: any; 
}

export default function PostCard({ 
  id, title, content, category, createdAt, imageUrl, country, className, date, excerpt 
}: PostCardProps) {

  const finalExcerpt = excerpt || (content ? content.replace(/<[^>]*>?/gm, '').substring(0, 120) + "..." : "");
  const finalDate = date || (createdAt ? new Date(createdAt).toLocaleDateString() : "");

  return (
    <Link href={`/post/${id}`}>
      <Card className={`overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 flex flex-col h-full ${className || ''}`}>
        
        {/* --- ARREGLO DE IMAGEN --- */}
        {imageUrl && (
          <div className="w-full overflow-hidden bg-gray-100">
            {/* Quitamos 'h-48' y 'absolute' para que la altura sea automática según la imagen */}
            {/* Usamos 'w-full' para que ocupe el ancho y 'h-auto' para mantener proporción */}
            {/* 'max-h-[300px]' evita que una imagen vertical sea demasiado alta */}
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-auto max-h-[300px] object-cover transition-transform duration-500 hover:scale-105" 
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-xl font-heading font-bold mb-2 line-clamp-2 leading-tight">{title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{finalExcerpt}</p>
          </div>

          <div>
            {/* LÍNEA SEPARADORA */}
            <div className="border-t border-border/50 my-3"></div>

            {/* --- PIE DE LA TARJETA (ALINEACIÓN Y BOTONES) --- */}
            <div className="flex items-center justify-between">
              
              {/* IZQUIERDA: Datos alineados al centro verticalmente */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-normal px-2 py-1 h-6 flex items-center">{category}</Badge>
                
                {finalDate && (
                  <div className="flex items-center text-xs text-muted-foreground h-6">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{finalDate}</span>
                  </div>
                )}

                {country && (
                  <div className="flex items-center text-xs text-muted-foreground h-6">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="max-w-[80px] truncate">{country}</span>
                  </div>
                )}
              </div>

              {/* DERECHA: Botones de Acción */}
              <div className="flex items-center gap-1 h-6"> {/* Altura fija h-6 para alinear con la izquierda */}
                <div onClick={(e) => e.stopPropagation()} className="flex gap-0 items-center">
                   {/* Botón de Like */}
                   <LikeButton postId={id} />
                   
                   {/* --- ARREGLO: BOTÓN GUARDAR AÑADIDO --- */}
                   <div className="scale-90"> {/* Pequeño ajuste de escala si se ve muy grande */}
                     <BookmarkButton postId={id} />
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}