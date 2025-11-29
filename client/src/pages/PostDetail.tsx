import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { type Post } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Send} from "lucide-react"; // Importamos flechas
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import CommentSection from "@/components/CommentSection";
import ThemeToggle from "@/components/ThemeToggle";
import DOMPurify from 'dompurify';
import NavButton from "@/components/NavButton"; // <-- ¡Importar esto!

// Tipo para la respuesta de la API
type PostData = {
  current: Post;
  prev?: Post;
  next?: Post;
};

export default function PostDetails() {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id;

  const [data, setData] = useState<PostData | null>(null); // Guardamos todo el paquete
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(false);
        // Hacemos scroll arriba al cambiar de post
        window.scrollTo(0, 0); 
        
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, { credentials: 'include' });
        if (!response.ok) throw new Error("Error al cargar post");
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]); // Se ejecuta cada vez que el ID cambia (al navegar)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("¡Enlace copiado!");
  };

  if (isLoading) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center py-20"><div className="text-lg text-muted-foreground animate-pulse">Cargando...</div></main><Footer /></div>;
  if (error || !data) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center py-20"><div className="text-lg text-destructive">Post no encontrado.</div></main><Footer /></div>;

  const { current: post, prev, next } = data;
  const formattedDate = new Date(post.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-4 right-4 z-50"> <ThemeToggle /> </div>
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-4xl mx-auto">
          
          {/* Imagen */}
          {post.imageUrl && (
            <div className="flex justify-center mb-8">
              <div className="relative max-w-full rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <img src={post.imageUrl} alt={post.title} className="block w-auto h-auto max-h-[650px]" />
              </div>
            </div>
          )}

          {/* Barra Superior */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-border/50">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1 capitalize font-medium">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground"><Calendar className="h-4 w-4 mr-2 opacity-70" /> <span>{formattedDate}</span></div>
              {post.country && <div className="flex items-center text-sm text-muted-foreground"><MapPin className="h-4 w-4 mr-2 opacity-70" /> <span>{post.country}</span></div>}
            </div>
            <div className="flex items-center gap-2">
              <LikeButton postId={post.id} />
              <BookmarkButton postId={post.id} />
              <Button variant="ghost" size="icon" onClick={handleShare}><Send className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors rotate-15" /></Button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 leading-tight">{post.title}</h1>
          
          <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-muted-foreground leading-relaxed ql-editor" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => <Badge key={i} variant="outline">#{tag}</Badge>)}
              </div>
            </div>
          )}

          {/* --- NAVEGACIÓN ANTERIOR / SIGUIENTE (CON IMAGEN Y FILTRO) --- */}
          <div className="mt-16 pt-12 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usamos el componente NavButton para ambas direcciones */}
              <NavButton post={prev} direction="prev" />
              <NavButton post={next} direction="next" />
            </div>
          </div>

          {/* Comentarios */}
          <div className="mt-12"> <CommentSection postId={post.id} /> </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}