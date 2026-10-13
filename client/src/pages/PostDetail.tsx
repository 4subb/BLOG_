import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { type Post } from "@shared/schema";
import { Link } from "wouter";
import { motion, useScroll, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import CommentSection from "@/components/CommentSection";
import DOMPurify from 'dompurify';
import NavButton from "@/components/NavButton";
import { SmartMedia } from "@/components/SmartMedia"; // 🟢 CONEXIÓN CDN: Importamos el componente inteligente
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type PostData = {
  current: Post;
  prev?: Post;
  next?: Post;
};

export default function PostDetails() {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id;

  const [data, setData] = useState<PostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isFlying, setIsFlying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Barra de progreso de lectura (muelle para que no tiemble con la rueda del ratón)
  const { scrollYProgress } = useScroll();
  const readingProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(false);
        window.scrollTo(0, 0);
        
        const response = await fetch(`/api/posts/${postId}`, { credentials: 'include' });
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
  }, [postId]);

  const handleShare = () => {
    setIsFlying(true);
    navigator.clipboard.writeText(window.location.href);

    setTimeout(() => {
      setIsFlying(false); 
      setCopied(true);    
      setTimeout(() => setCopied(false), 2000);
    }, 800); 
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <div className="mb-8 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mb-4 h-10 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mb-10 h-10 w-3/5 animate-pulse rounded bg-muted" />
        <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-medium">Post no encontrado.</p>
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const { current: post, prev, next } = data;
  const formattedDate = new Date(post.createdAt).toLocaleDateString();

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: readingProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-foreground"
      />

      <article className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <Stagger stagger={0.08}>
          <StaggerItem>
            <button
              onClick={() => window.history.back()}
              className="group mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Volver
            </button>
          </StaggerItem>

          <StaggerItem className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-foreground/80">{post.category}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formattedDate}</span>
            {post.country && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {post.country}</span>
              </>
            )}
          </StaggerItem>

          <StaggerItem>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl">{post.title}</h1>
          </StaggerItem>

          {/* Acciones */}
          <StaggerItem className="mt-8 flex items-center gap-1 border-y border-border/60 py-2">
            <LikeButton postId={post.id} />
            <BookmarkButton postId={post.id} />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="relative ml-auto overflow-hidden"
              title="Compartir"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500 animate-in zoom-in duration-300" />
              ) : (
                <Send
                  className={`h-4 w-4 transition-all duration-700 ${isFlying ? "animate-fly" : ""}`}
                />
              )}
            </Button>
          </StaggerItem>

          {/* 🟢 SECCIÓN MULTIMEDIA INTELIGENTE CONECTADA A TU CDN */}
          {post.imageUrl && (
            <StaggerItem className="mt-10 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
              <SmartMedia
                src={post.imageUrl}
                alt={post.title}
                className="mx-auto block h-auto max-h-[650px] w-full object-contain"
              />
            </StaggerItem>
          )}

          <StaggerItem>
            <div
              className="ql-editor prose prose-neutral mt-12 max-w-none px-0 dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:underline-offset-4 prose-img:rounded-xl md:prose-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </StaggerItem>
        </Stagger>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-14 flex flex-wrap gap-2">
            {post.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="rounded-full font-normal text-muted-foreground">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Navegación */}
        <div className="mt-16 grid grid-cols-1 gap-4 border-t border-border/60 pt-12 md:grid-cols-2">
          <NavButton post={prev} direction="prev" />
          <NavButton post={next} direction="next" />
        </div>

        {/* Comentarios */}
        <div className="mt-16"> <CommentSection postId={post.id} /> </div>
      </article>
    </>
  );
}
