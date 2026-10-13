import type { LucideIcon } from "lucide-react";

export default function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-20 text-center">
      <Icon className="mb-4 h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
