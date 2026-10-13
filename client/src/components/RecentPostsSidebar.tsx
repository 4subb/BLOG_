import { Link } from "wouter";
import { motion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

interface RecentPost {
  id: string;
  title: string;
  category: string;
  date: string;
}

interface RecentPostsSidebarProps {
  posts: RecentPost[];
  title?: string | null; // null oculta el título (cuando el contenedor ya tiene el suyo)
}

export default function RecentPostsSidebar({ posts, title = "Publicaciones recientes" }: RecentPostsSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      {title && (
        <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground" data-testid="text-sidebar-title">
          {title}
        </h3>
      )}
      <ul className="divide-y divide-border/60 border-y border-border/60">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/post/${post.id}`} className="group block py-4" data-testid={`card-recent-${post.id}`}>
              <motion.div whileHover={{ x: 4 }} transition={springSnappy}>
                <div className="mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono uppercase tracking-[0.1em]">{post.category}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                  <time>{post.date}</time>
                </div>
                <h4
                  className="line-clamp-2 text-sm font-medium leading-snug text-foreground/90 transition-colors group-hover:text-foreground"
                  data-testid={`text-recent-title-${post.id}`}
                >
                  {post.title}
                </h4>
              </motion.div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
