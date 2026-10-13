import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { hoverLift } from "@/lib/motion";

interface SectionCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  category: string;
}

export default function SectionCard({ title, description, imageSrc, href, category }: SectionCardProps) {
  return (
    <Link href={href} className="block rounded-xl">
      <motion.div
        {...hoverLift}
        className="group relative h-[300px] cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card transition-shadow duration-300 hover:shadow-xl"
        data-testid={`card-section-${category}`}
      >
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.4] transition-all duration-700 ease-out-expo group-hover:scale-[1.05] group-hover:grayscale-0"
          data-testid={`img-section-${category}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />

        <div className="relative flex h-full flex-col justify-end p-6 text-white">
          <h3 className="text-xl font-semibold tracking-tight" data-testid={`text-title-${category}`}>
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-white/70" data-testid={`text-description-${category}`}>
            {description}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-white/90">
            <span>Explorar</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
