import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { type Post, type PostSummary } from "@shared/schema";
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
import { useTranslation } from "react-i18next";
import { LiveClock, Rule, SectionHead, SplitReveal } from "@/components/mission/primitives";
import { easeOutExpo } from "@/lib/motion";
import { dotDate, stripHtml } from "@/lib/posts";

type PostData = {
  current: Post;
  prev?: PostSummary;
  next?: PostSummary;
};

export default function PostDetails() {
  const { t } = useTranslation();
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
        <div className="mb-8 h-3 w-32 animate-pulse bg-muted" />
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
  const readMinutes = Math.max(1, Math.round(stripHtml(post.content).split(" ").length / 200));
  const specs = [
    { label: t("ui.category"), value: post.category },
    { label: t("ui.date"), value: dotDate(post.createdAt) },
    { label: t("ui.country"), value: post.country || "—" },
    { label: t("ui.minRead"), value: `${String(readMinutes).padStart(2, "0")} min` },
  ];

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: readingProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-signal"
      />

      <article>
        <header className="page-container pb-12 pt-8 sm:pt-10">
          <div className="label-mono flex items-center justify-between gap-4 text-muted-foreground">
            <button onClick={() => window.history.back()} className="group inline-flex items-center gap-2 transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" /> {t("ui.back")}
            </button>
            <LiveClock className="hidden sm:inline" />
          </div>

          <h1 className="font-display mt-14 max-w-[18ch] text-[clamp(2.6rem,7vw,7rem)] sm:mt-20">
            <SplitReveal text={post.title} stagger={0.04} />
          </h1>

          <dl className="mt-14 grid grid-cols-2 gap-x-6 sm:grid-cols-4 sm:gap-x-10">
            {specs.map((spec, i) => (
              <div key={spec.label} className="pb-4">
                <Rule delay={0.2 + i * 0.08} />
                <dt className="label-mono pt-3 text-muted-foreground">{spec.label}</dt>
                <dd className="mt-2 truncate text-lg first-letter:uppercase">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* 🟢 SECCIÓN MULTIMEDIA INTELIGENTE CONECTADA A TU CDN */}
        {post.imageUrl && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.4, ease: easeOutExpo, delay: 0.35 }}
            className="page-container"
          >
            <div className="overflow-hidden bg-muted">
              <SmartMedia src={post.imageUrl} alt={post.title} className="mx-auto block max-h-[80vh] w-full object-cover" />
            </div>
          </motion.div>
        )}

        <div className="page-container grid gap-12 py-16 sm:py-24 lg:grid-cols-12">
          {/* Columna de acciones (sticky) */}
          <aside className="lg:col-span-3">
            <div className="flex items-center gap-1 lg:sticky lg:top-24 lg:flex-col lg:items-start">
              <p className="label-mono mb-2 hidden text-muted-foreground lg:block">{t("ui.connect")}</p>
              <div className="flex items-center gap-1">
                <LikeButton postId={post.id} />
                <BookmarkButton postId={post.id} />
                <Button variant="ghost" size="icon" onClick={handleShare} className="relative overflow-hidden" title="Compartir">
                  {copied ? (
                    <Check className="h-4 w-4 text-signal animate-in zoom-in duration-300" />
                  ) : (
                    <Send className={`h-4 w-4 transition-all duration-700 ${isFlying ? "animate-fly" : ""}`} />
                  )}
                </Button>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="ml-auto flex flex-wrap gap-x-3 gap-y-1 lg:ml-0 lg:mt-6">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="label-mono text-muted-foreground">#{tag.replace(/^#+/, "")}</span>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-8">
            <div
              className="ql-editor prose prose-neutral max-w-none px-0 text-foreground/90 dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-a:text-signal prose-a:underline-offset-4 prose-img:rounded-none md:prose-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </div>
        </div>

        {/* Navegación */}
        <div className="page-container pb-16">
          <SectionHead index="→" title={`${t("ui.prev")} / ${t("ui.next")}`} className="mb-8" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <NavButton post={prev} direction="prev" />
            <NavButton post={next} direction="next" />
          </div>
        </div>

        {/* Comentarios */}
        <div className="page-container pb-24">
          <div className="max-w-3xl"><CommentSection postId={post.id} /></div>
        </div>
      </article>
    </>
  );
}
