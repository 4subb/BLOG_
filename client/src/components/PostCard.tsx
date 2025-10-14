import { Calendar, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
}

export default function PostCard({ id, title, excerpt, category, date, imageUrl, tags = [] }: PostCardProps) {
  return (
    <Link href={`/post/${id}`}>
      <Card className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-500 cursor-pointer border-card-border" data-testid={`card-post-${id}`}>
        {imageUrl && (
          <div className="relative overflow-hidden h-48">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              data-testid={`img-post-${id}`}
            />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${id}`}>
              {category}
            </Badge>
            {tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-xl font-heading font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2" data-testid={`text-title-${id}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-excerpt-${id}`}>
            {excerpt}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
