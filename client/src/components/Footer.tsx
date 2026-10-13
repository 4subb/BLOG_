import { Github, Linkedin, Mail } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next"; // 1. IMPORTAMOS EL TRADUCTOR
import { springSnappy } from "@/lib/motion";

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
    <footer className="mt-auto border-t border-border/60">
      <div className="page-container flex flex-col gap-10 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-3">
          <p className="text-sm font-semibold tracking-tight" data-testid="text-footer-brand">
            José Ángel Subías
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('footer.subtitle')}</p>
        </div>

        <div className="flex gap-16">
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground/80">{t('footer.sectionsTitle')}</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.sections.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground/80">{t('footer.connectTitle')}</h4>
            <div className="flex gap-1">
              {footerLinks.social.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.label !== "Email" ? "_blank" : undefined}
                  rel={social.label !== "Email" ? "noreferrer" : undefined}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={springSnappy}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  data-testid={`button-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container border-t border-border/60 py-6">
        <p className="text-xs text-muted-foreground" data-testid="text-footer-copyright">
          © {currentYear} José Ángel Subías Tovar. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
