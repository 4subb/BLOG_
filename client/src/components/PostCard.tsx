import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useScramble } from "@/components/mission/primitives";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import { dotDate } from "@/lib/posts";

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
  readMinutes?: number;
  index?: number;
  tags?: string[] | null;
  className?: string;
  // "grid": tarjeta vertical. "list": horizontal en desktop.
  layout?: "grid" | "list";
  [key: string]: any;
}

/** Tarjeta de entrada estilo "hoja de progreso": imagen recta que se destapa, meta mono y título. */
export default function PostCard({
  id, title, content, category, createdAt, imageUrl, country, className, excerpt, readMinutes, index, layout = "grid",
}: PostCardProps) {
  const { t } = useTranslation();
  const [readLabel, playRead] = useScramble(`${t("ui.read")} →`.toUpperCase());

  const finalExcerpt = excerpt || (content ? content.replace(/<[^>]*>?/gm, "").substring(0, 140) + "…" : "");
  const isList = layout === "list";

  return (
    <Link
      href={`/post/${id}`}
      onMouseEnter={playRead}
      className={cn("group block outline-none", isList && "sm:grid sm:grid-cols-12 sm:gap-8", className)}
    >
      <div className={cn("relative overflow-hidden bg-muted", isList ? "aspect-[4/3] sm:col-span-5" : "aspect-[4/3]")}>
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={title}
            loading="lazy"
            initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.2, ease: easeOutExpo }}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:!scale-[1.05]"
          />
        ) : (
          // Sin imagen: panel tipográfico con el índice en grande
          <div className="flex h-full w-full items-end justify-between p-5">
            <span className="font-display text-[7rem] leading-[0.75] text-background/70 mix-blend-normal">
              {String(index ?? 0).padStart(2, "0")}
            </span>
            <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <span className="label-mono absolute left-3 top-3 bg-background/90 px-2 py-1.5 text-foreground backdrop-blur">
          {category}
        </span>
      </div>

      <div className={cn("pt-5", isList && "sm:col-span-7 sm:pt-0")}>
        <div className="label-mono flex items-center gap-3 text-muted-foreground">
          {createdAt && <time>{dotDate(createdAt)}</time>}
          {readMinutes && <span>· {readMinutes} {t("ui.minRead")}</span>}
          {country && <span className="truncate">· {country}</span>}
        </div>
        <h3 className={cn("mt-3 font-medium leading-[1.1] tracking-[-0.02em] transition-colors group-hover:text-signal", isList ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
          {title}
        </h3>
        {finalExcerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{finalExcerpt}</p>}

        <div className="mt-5 flex items-center justify-between border-t border-rock/40 pt-3">
          <span className="label-mono text-foreground" aria-hidden>{readLabel}</span>
          {/* Los botones hacen preventDefault/stopPropagation para no disparar el Link */}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center">
            <LikeButton postId={id} />
            <BookmarkButton postId={id} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PostCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  const isList = layout === "list";
  return (
    <div className={cn(isList && "sm:grid sm:grid-cols-12 sm:gap-8")}>
      <div className={cn("aspect-[4/3] animate-pulse bg-muted", isList && "sm:col-span-5")} />
      <div className={cn("space-y-3 pt-5", isList && "sm:col-span-7 sm:pt-0")}>
        <div className="h-2.5 w-28 animate-pulse bg-muted" />
        <div className="h-6 w-4/5 animate-pulse bg-muted" />
        <div className="h-3 w-full animate-pulse bg-muted" />
      </div>
    </div>
  );
}
