import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SectionCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  category: string;
}

export default function SectionCard({ title, description, imageSrc, href, category }: SectionCardProps) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-lg border bg-card hover-elevate active-elevate-2 transition-all duration-500 cursor-pointer h-[320px]" data-testid={`card-section-${category}`}>
        <div className="absolute inset-0">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
            data-testid={`img-section-${category}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent group-hover:from-background/95 group-hover:via-background/50 transition-all duration-500" />
        </div>
        
        <div className="relative h-full flex flex-col justify-end p-6">
          <h3 className="text-2xl font-heading font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300" data-testid={`text-title-${category}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-description-${category}`}>
            {description}
          </p>
          <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Explorar</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
