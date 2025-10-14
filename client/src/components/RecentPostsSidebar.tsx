import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Link } from "wouter";

interface RecentPost {
  id: string;
  title: string;
  category: string;
  date: string;
}

interface RecentPostsSidebarProps {
  posts: RecentPost[];
}

export default function RecentPostsSidebar({ posts }: RecentPostsSidebarProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold px-1" data-testid="text-sidebar-title">
        Publicaciones Recientes
      </h3>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all duration-300" data-testid={`card-recent-${post.id}`}>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
                <h4 className="text-sm font-medium line-clamp-2 leading-snug" data-testid={`text-recent-title-${post.id}`}>
                  {post.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{post.date}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
