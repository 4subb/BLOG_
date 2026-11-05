import { cn } from "@/lib/utils";

/** Cinta infinita de texto. La pista se duplica para que el bucle sea continuo. */
export default function Marquee({ items, className, speed = 40 }: { items: string[]; className?: string; speed?: number }) {
  const track = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          <span>{item}</span>
          <span className="text-signal">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("group flex overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <div className="flex animate-marquee group-hover:[animation-play-state:paused]" style={{ animationDuration: `${speed}s` }}>
        {track}
        {track}
      </div>
    </div>
  );
}
