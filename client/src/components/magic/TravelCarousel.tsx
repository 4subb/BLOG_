import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

export interface TravelCard {
  image: string;
  tag: string;
  title: string;
  description: string;
  location: string;
  link?: string;
}

interface TravelCarouselProps {
  cards: TravelCard[];
  sectionTitle?: string;
}

export function TravelCarousel({ cards, sectionTitle }: TravelCarouselProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, +1 right
  const total = cards.length;

  const go = useCallback((next: number) => {
    setDirection(next > active ? 1 : -1);
    setActive(next);
  }, [active]);

  const prev = () => go(active === 0 ? total - 1 : active - 1);
  const next = () => go(active === total - 1 ? 0 : active + 1);

  // Indices for the visible cards: left peek, center, right peek
  const prevIdx = (active - 1 + total) % total;
  const nextIdx = (active + 1) % total;

  return (
    <div className="w-full select-none">
      {sectionTitle && (
        <p className="text-xs text-muted-foreground/70 uppercase tracking-widest mb-3 px-1 font-medium">
          {sectionTitle}
        </p>
      )}

      {/* Card strip */}
      <div className="relative flex items-stretch gap-2 overflow-hidden" style={{ height: "420px" }}>

        {/* Left peek card */}
        <motion.div
          key={`prev-${prevIdx}`}
          onClick={prev}
          className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{ width: "15%" }}
          animate={{ opacity: 0.5, scale: 0.97 }}
          whileHover={{ opacity: 0.75 }}
          transition={{ duration: 0.35 }}
        >
          <img
            src={cards[prevIdx].image}
            alt={cards[prevIdx].title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Center featured card */}
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={active}
            className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer group"
            initial={{ opacity: 0, x: direction * 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -60, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src={cards[active].image}
              alt={cards[active].title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              draggable={false}
            />

            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Tag pill */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-primary rounded-full inline-block" />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  {cards[active].tag}
                </span>
              </div>

              <h3 className="text-white text-2xl md:text-3xl font-bold leading-snug mb-3">
                {cards[active].title}
              </h3>

              <p className="text-white/75 text-sm leading-relaxed max-w-lg">
                {cards[active].description}
              </p>

              <div className="flex items-center gap-1 mt-4 text-white/50 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{cards[active].location}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right peek card */}
        <motion.div
          key={`next-${nextIdx}`}
          onClick={next}
          className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{ width: "15%" }}
          animate={{ opacity: 0.5, scale: 0.97 }}
          whileHover={{ opacity: 0.75 }}
          transition={{ duration: 0.35 }}
        >
          <img
            src={cards[nextIdx].image}
            alt={cards[nextIdx].title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between mt-5 px-1">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent hover:border-primary/50 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={next}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent hover:border-primary/50 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
