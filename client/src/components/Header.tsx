import { Menu, X, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { cn } from "@/lib/utils";
import { easeOutExpo, springSoft } from "@/lib/motion";
import { useScramble } from "@/components/mission/primitives";

export default function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();

  // La barra gana opacidad y borde en cuanto el contenido pasa por debajo.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  // Cerrar el menú móvil al navegar.
  useEffect(() => setMobileMenuOpen(false), [location]);

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/academico", label: t("nav.academic") },
    { path: "/ingenieria", label: t("nav.engineering") },
    { path: "/deportes", label: t("nav.sports") },
    { path: "/viajes", label: t("nav.travel") },
    { path: "/lectura", label: t("nav.reading") },
    { path: "/galeria", label: t("nav.gallery") },
  ];

  const isActive = (path: string) => (path === "/" ? location === "/" : location.startsWith(path));

  const displayName = user?.username || user?.email?.split("@")[0];
  const avatarSrc = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-500",
        scrolled || mobileMenuOpen
          ? "border-rock/40 bg-background/85 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-background/0",
      )}
    >
      <div className="page-container">
        <div className="flex h-16 items-center gap-8">
          {/* Marca */}
          <Link href="/" className="group flex shrink-0 items-baseline gap-3">
            <span className="font-display text-xl leading-none tracking-[-0.03em]">Ángel Subías</span>
            <span className="label-mono hidden text-muted-foreground transition-colors group-hover:text-signal xl:inline">/ Ing. Mecatrónica</span>
          </Link>

          {/* Navegación desktop */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navItems.map((item, i) => (
              <NavItem key={item.path} href={item.path} index={i + 1} label={item.label} active={isActive(item.path)} />
            ))}
          </nav>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-1 lg:ml-4 lg:border-l lg:border-rock/40 lg:pl-4">
            <SpotifyPlayer />
            <LanguageToggle />
            <ThemeToggle />

            <div className="ml-2 hidden items-center gap-2 lg:flex">
              {isLoading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={springSoft}
                      className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-rock transition-shadow hover:ring-signal"
                      aria-label="Menú de usuario"
                    >
                      <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" /> Perfil
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Panel de control
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/login"
                  className="label-mono inline-flex h-9 items-center rounded-full border border-rock px-4 text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {t("ui.signIn")}
                </Link>
              )}
            </div>

            {/* Botón menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
              className="overflow-hidden lg:hidden"
            >
              <motion.nav
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } }}
                className="flex flex-col gap-0.5 pb-4 pt-2"
              >
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                  >
                    <Link
                      href={item.path}
                      className="flex items-baseline gap-4 border-t border-rock/40 py-3"
                    >
                      <span className="label-mono w-6 text-muted-foreground">{String(navItems.indexOf(item) + 1).padStart(2, "0")}</span>
                      <span className={cn("font-display text-3xl", isActive(item.path) ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                      {isActive(item.path) && <span className="ml-auto h-2 w-2 self-center rounded-full bg-signal" />}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-rock/40 pt-4">
                  {isLoading ? null : isAuthenticated ? (
                    <div className="flex flex-col gap-0.5">
                      <Link href="/profile" className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent/60">
                        <img src={avatarSrc} alt="Avatar" className="h-7 w-7 rounded-full ring-1 ring-border" />
                        <span className="text-sm font-medium">{displayName}</span>
                      </Link>
                      {isAdmin && (
                        <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground">
                          <LayoutDashboard className="h-4 w-4" /> Panel de control
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 px-1">
                      <Link href="/login"><Button variant="outline" className="w-full">Iniciar sesión</Button></Link>
                      <Link href="/register"><Button className="w-full">Registrarse</Button></Link>
                    </div>
                  )}
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/** Enlace de navegación: índice mono, punto naranja deslizante en la ruta activa y texto que se descifra al hover. */
function NavItem({ href, index, label, active }: { href: string; index: number; label: string; active: boolean }) {
  const [text, play] = useScramble(label.toUpperCase());
  return (
    <Link
      href={href}
      onMouseEnter={play}
      onFocus={play}
      className={cn(
        "label-mono relative flex items-center gap-1.5 px-2.5 py-2 transition-colors duration-200",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        {active && <motion.span layoutId="nav-dot" transition={springSoft} className="absolute h-1.5 w-1.5 rounded-full bg-signal" />}
      </span>
      <span className="text-[10px] text-muted-foreground/70">{String(index).padStart(2, "0")}</span>
      <span aria-label={label}>{text}</span>
    </Link>
  );
}
