import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function BookmarkButton({ postId }: { postId: string }) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`http://localhost:5000/api/posts/${postId}/bookmark`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsSaved(data.isSaved))
      .catch(console.error);
  }, [postId, isAuthenticated]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { alert("Inicia sesión para guardar posts"); return; }

    setIsSaved(!isSaved); // Optimistic update
    try {
      await fetch(`http://localhost:5000/api/posts/${postId}/bookmark`, { method: 'POST', credentials: 'include' });
    } catch (error) { setIsSaved(!isSaved); } // Revertir si falla
  };

  return (
    <Button variant="ghost" size="icon" className="hover:bg-transparent" onClick={handleSave}>
      <motion.div whileTap={{ scale: 0.8 }}>
        <Bookmark className={`h-5 w-5 transition-all ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
      </motion.div>
    </Button>
  );
}