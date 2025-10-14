import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    sections: [
      { name: "Ingeniería", href: "/ingenieria" },
      { name: "Deportes", href: "/deportes" },
      { name: "Viajes y Fotografía", href: "/viajes" },
    ],
    social: [
      { icon: Github, href: "#", label: "GitHub" },
      { icon: Linkedin, href: "#", label: "LinkedIn" },
      { icon: Mail, href: "#", label: "Email" },
    ],
  };

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent" data-testid="text-footer-brand">
              Blog Multi-Temático
            </h3>
            <p className="text-sm text-muted-foreground">
              Compartiendo conocimiento en ingeniería, deportes y aventuras alrededor del mundo.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Secciones</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.sections.map((link) => (
                <Link key={link.name} href={link.href}>
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-0 text-muted-foreground hover:text-primary" data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Conecta</h4>
            <div className="flex gap-2">
              {footerLinks.social.map((social) => (
                <Button
                  key={social.label}
                  variant="outline"
                  size="icon"
                  className="hover-elevate rounded-full"
                  asChild
                  data-testid={`button-social-${social.label.toLowerCase()}`}
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © {currentYear} Blog Multi-Temático. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
