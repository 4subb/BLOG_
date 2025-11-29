// Contenido NUEVO (actualizado) para client/src/components/CommentSection.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { UserCircle2, Trash2 } from "lucide-react"; // Importamos un icono de basura

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  author: string; 
}

export default function CommentSection({ postId }: { postId: string }) {
  // 1. (ACTUALIZADO) ¡Obtenemos 'isAdmin' de nuestro cerebro global!
  const { user, isAuthenticated, isAdmin } = useAuth(); 
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect para cargar comentarios (sin cambios)
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Error cargando comentarios:", error);
      }
    };
    fetchComments();
  }, [postId]);

  // handleSubmit para crear comentarios (sin cambios)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ content: newComment, postId }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        const commentWithAuthor = { 
            ...savedComment, 
            author: user?.email || "Yo" 
        };
        setComments([commentWithAuthor, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error enviando comentario:", error);
      alert("No se pudo enviar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. ¡NUEVA FUNCIÓN! Manejador para BORRAR un comentario
  const handleDelete = async (commentId: string) => {
    // Pedimos confirmación para no borrar accidentalmente
    if (!window.confirm("¿Estás seguro de que quieres borrar este comentario?")) {
      return;
    }

    try {
      // Llamamos a la API de DELETE que creamos (¡y enviamos la cookie!)
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include' 
      });

      if (res.ok) {
        // ¡Éxito! Actualizamos el "estado" local para que
        // el comentario desaparezca de la pantalla SIN recargar.
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
      } else {
        // El backend nos dijo que no (ej. 403, 404)
        const data = await res.json();
        alert(`Error al borrar: ${data.message}`);
      }
    } catch (error) {
      console.error("Error de red al borrar:", error);
      alert("No se pudo borrar el comentario.");
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">Comentarios ({comments.length})</h3>

      {/* Formulario de Comentario (sin cambios) */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-muted/30 p-4 rounded-lg">
          {/* ... (tu formulario de 'Escribe tu opinión...') ... */}
          {/* 1. Añadimos un 'htmlFor' que coincida con el 'id' */}
          <label htmlFor="comment-textarea" className="block mb-2 text-sm font-medium">
            Comentar como <span className="text-primary">{user?.email}</span>
          </label>
          <Textarea
            id="comment-textarea" // <-- 2. Añadimos el ID
            name="comment"        // <-- 3. Añadimos el 'name' (esto arregla la otra advertencia)
            placeholder="Escribe tu opinión..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3 bg-background"
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Publicando..." : "Publicar Comentario"}
          </Button>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-muted/50 rounded-lg text-center">
          <p className="mb-3 text-muted-foreground">Inicia sesión para unirte a la conversación.</p>
          <Link href="/login">
            <Button variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      )}

      {/* 3. (ACTUALIZADO) Lista de Comentarios */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground italic">Sé el primero en comentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="mt-1">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* 4. ¡EL BOTÓN DE ADMIN! */}
                  {/* Se muestra solo si 'isAdmin' es true */}
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-auto h-7 w-7 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                </div>
                <p className="text-sm text-foreground/90">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}