import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next"; // 1. IMPORTAMOS EL TRADUCTOR

export default function Footer() {
  const { t } = useTranslation(); // 2. INICIAMOS EL TRADUCTOR
  const currentYear = new Date().getFullYear();

  // Ponemos los enlaces aquí adentro para que t() funcione
  const footerLinks = {
    sections: [
      { name: t('footer.engineering'), href: "/ingenieria" },
      { name: t('footer.sports'), href: "/deportes" },
      { name: t('footer.travel'), href: "/viajes" },
    ],
    social: [
      { 
        icon: Github, 
        href: "https://github.com/4subb/BLOG_", 
        label: "GitHub" 
      },
      { 
        icon: Linkedin, 
        href: "https://www.linkedin.com/in/jos%C3%A9-%C3%A1ngel-sub%C3%ADas-tovar-a74874278/", 
        label: "LinkedIn" 
      },
      { 
        icon: Mail, 
        href: "mailto:21030382@itcelaya.edu.mx", 
        label: "Email" 
      },
    ],
  };

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent" data-testid="text-footer-brand">
              José Ángel Subías
            </h3>
            {/* 3. APLICAMOS LA TRADUCCIÓN */}
            <p className="text-sm text-muted-foreground">
              {t('footer.subtitle')} 
            </p>
          </div>

          <div className="space-y-4">
            {/* 3. APLICAMOS LA TRADUCCIÓN */}
            <h4 className="text-sm font-semibold text-foreground">{t('footer.sectionsTitle')}</h4>
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
            {/* 3. APLICAMOS LA TRADUCCIÓN */}
            <h4 className="text-sm font-semibold text-foreground">{t('footer.connectTitle')}</h4>
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
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    target={social.label !== "Email" ? "_blank" : undefined}
                    rel={social.label !== "Email" ? "noreferrer" : undefined}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          {/* 3. APLICAMOS LA TRADUCCIÓN */}
          <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
            © {currentYear} José Ángel Subías Tovar. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}