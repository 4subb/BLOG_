import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { cn } from "@/lib/utils";
import { hoverLift } from "@/lib/motion";

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
  // "grid": tarjeta vertical (rejillas). "list": horizontal en desktop (listados de lectura).
  layout?: "grid" | "list";
  [key: string]: any;
}

export default function PostCard({
  id, title, content, category, createdAt, imageUrl, country, className, date, excerpt, layout = "grid",
}: PostCardProps) {

  const finalExcerpt = excerpt || (content ? content.replace(/<[^>]*>?/gm, '').substring(0, 120) + "..." : "");
  const finalDate = date || (createdAt ? new Date(createdAt).toLocaleDateString() : "");
  const isList = layout === "list";

  return (
    <Link href={`/post/${id}`} className="block h-full rounded-xl focus-visible:outline-none">
      <motion.article
        {...hoverLift}
        className={cn(
          "group relative flex h-full overflow-hidden rounded-xl border border-border/70 bg-card",
          "transition-[border-color,box-shadow] duration-300 hover:border-foreground/15 hover:shadow-lg",
          isList ? "flex-col sm:flex-row" : "flex-col",
          className,
        )}
      >
        {imageUrl && (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden bg-muted",
              isList ? "aspect-[16/9] sm:aspect-auto sm:w-64 md:w-72" : "aspect-[16/10]",
            )}
          >
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.1em] text-foreground/80">{category}</span>
            {finalDate && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                <time>{finalDate}</time>
              </>
            )}
            {country && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                <span className="flex max-w-[110px] items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" /> {country}
                </span>
              </>
            )}
          </div>

          <h3 className="mb-2 flex items-start justify-between gap-3 text-lg font-semibold leading-snug tracking-tight">
            <span className="line-clamp-2">{title}</span>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{finalExcerpt}</p>

          <div className="mt-auto flex items-center justify-end gap-0.5 pt-5">
            {/* Los botones hacen preventDefault/stopPropagation para no disparar el Link */}
            <div onClick={(e) => e.stopPropagation()} className="flex items-center">
              <LikeButton postId={id} />
              <BookmarkButton postId={id} />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export function PostCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  const isList = layout === "list";
  return (
    <div className={cn("flex overflow-hidden rounded-xl border border-border/70 bg-card", isList ? "flex-col sm:flex-row" : "flex-col")}>
      <div className={cn("animate-pulse bg-muted", isList ? "aspect-[16/9] sm:aspect-auto sm:h-auto sm:w-64 md:w-72" : "aspect-[16/10]")} />
      <div className="flex-1 space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
