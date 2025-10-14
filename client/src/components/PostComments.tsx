import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart, Eye } from "lucide-react";
import { useState } from "react";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface PostCommentsProps {
  postId: string;
  views: number;
  likes: number;
  comments: Comment[];
}

export default function PostComments({ postId, views, likes, comments }: PostCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Comment submitted:", newComment);
    setNewComment("");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    console.log("Post liked/unliked");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium" data-testid={`text-views-${postId}`}>{views} vistas</span>
          </div>
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="gap-2"
            data-testid={`button-like-${postId}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span data-testid={`text-likes-${postId}`}>{likes + (isLiked ? 1 : 0)}</span>
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium" data-testid={`text-comments-count-${postId}`}>{comments.length} comentarios</span>
          </div>
        </div>

        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            data-testid={`input-comment-${postId}`}
          />
          <Button type="submit" disabled={!newComment.trim()} data-testid={`button-submit-comment-${postId}`}>
            Publicar Comentario
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold">Comentarios</h3>
        {comments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4" data-testid={`comment-${comment.id}`}>
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{comment.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
