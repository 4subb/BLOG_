import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Marquee from "@/components/mission/Marquee";
import { LiveClock, Rule } from "@/components/mission/primitives";
import NowPlaying from "@/components/mission/NowPlaying";
import { easeOutExpo } from "@/lib/motion";
import { countryName, locationLabel, useVisitorLocation } from "@/lib/location";

const EMAIL = "angel.subias.tovar@gmail.com";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const sections = [
    { name: t("nav.academic"), href: "/academico" },
    { name: t("nav.engineering"), href: "/ingenieria" },
    { name: t("nav.sports"), href: "/deportes" },
    { name: t("nav.travel"), href: "/viajes" },
    { name: t("nav.reading"), href: "/lectura" },
    { name: t("nav.gallery"), href: "/galeria" },
  ];

  const social = [
    { label: "GitHub", href: "https://github.com/4subb/BLOG_" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jos%C3%A9-%C3%A1ngel-sub%C3%ADas-tovar-a74874278/" },
    { label: "Email", href: `mailto:${EMAIL}` },
  ];

  return (
    <footer className="mt-auto overflow-hidden border-t border-rock/40">
      <Marquee
        items={sections.map((s) => s.name)}
        className="font-display border-b border-rock/40 py-5 text-[clamp(1.5rem,3vw,2.5rem)] text-muted-foreground/60"
      />

      <div className="page-container grid gap-14 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="label-mono text-muted-foreground">({t("ui.connect")})</p>
          <p className="font-display mt-6 text-[clamp(2.5rem,5vw,4.5rem)]" data-testid="text-footer-brand">
            {t("ui.letsTalk")}
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="group mt-8 inline-flex items-center gap-3 border-b border-rock pb-1 text-lg transition-colors hover:border-signal hover:text-signal"
          >
            {EMAIL}
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
          <div>
            <p className="label-mono text-muted-foreground">{t("ui.sections")}</p>
            <Rule className="mt-3" />
            <nav className="mt-4 flex flex-col gap-2.5">
              {sections.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm transition-colors hover:text-signal">
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="label-mono text-muted-foreground">{t("ui.connect")}</p>
            <Rule className="mt-3" />
            <div className="mt-4 flex flex-col gap-2.5">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.label !== "Email" ? "_blank" : undefined}
                  rel={s.label !== "Email" ? "noreferrer" : undefined}
                  className="group inline-flex items-center gap-1 text-sm transition-colors hover:text-signal"
                  data-testid={`button-social-${s.label.toLowerCase()}`}
                >
                  {s.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="label-mono text-muted-foreground">{t("ui.location")}</p>
            <Rule className="mt-3" />
            <FooterLocation />
            <LiveClock className="label-mono mt-4 block text-muted-foreground" />
            <NowPlaying variant="card" />
          </div>
        </div>
      </div>

      {/* Firma gigante */}
      <div className="page-container overflow-hidden">
        <motion.p
          aria-hidden
          initial={{ y: "40%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: easeOutExpo }}
          className="font-display -mb-[0.12em] whitespace-nowrap text-[clamp(5rem,21vw,22rem)] leading-[0.8] tracking-[-0.05em]"
        >
          Subías<span className="text-signal">.</span>
        </motion.p>
      </div>

      <div className="page-container label-mono flex flex-col gap-2 border-t border-rock/40 py-5 text-muted-foreground sm:flex-row sm:justify-between">
        <span data-testid="text-footer-copyright">© {currentYear} José Ángel Subías Tovar. {t("footer.rights")}</span>
        <span>{t("ui.madeIn")}</span>
      </div>
    </footer>
  );
}

/** Ciudad y región/país del visitante (aproximado por IP o exacto si dio permiso). */
function FooterLocation() {
  const geo = useVisitorLocation();
  const country = countryName(geo?.countryCode);
  const detail = [geo?.region !== geo?.city ? geo?.region : undefined, country].filter(Boolean).join(", ");
  return (
    <p className="mt-4 text-sm leading-relaxed">
      {geo?.city ?? locationLabel(geo)}
      {detail && (
        <>
          <br />
          {detail}
        </>
      )}
    </p>
  );
}
