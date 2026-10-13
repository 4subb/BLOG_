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
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";
import { cn } from "@/lib/utils";
import { easeOutExpo, springSoft } from "@/lib/motion";

export default function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
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
  const activePath = navItems.find((item) => isActive(item.path))?.path ?? null;
  // La "píldora" sigue al cursor y vuelve a la ruta activa al salir de la nav.
  const pillPath = hoveredPath ?? activePath;

  const displayName = user?.username || user?.email?.split("@")[0];
  const avatarSrc = user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || mobileMenuOpen
          ? "border-border/70 bg-background/75 shadow-[0_1px_0_0_hsl(var(--foreground)/0.02)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-background/0",
      )}
    >
      <div className="page-container">
        <div className="flex h-14 items-center gap-6">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-md">
            <motion.span
              whileHover={{ rotate: -8, scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={springSoft}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[11px] font-semibold tracking-tight text-background"
            >
              ÁS
            </motion.span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Ángel Subías</span>
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden items-center lg:flex" onMouseLeave={() => setHoveredPath(null)}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  isActive(item.path) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {pillPath === item.path && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={springSoft}
                    className="absolute inset-0 -z-10 rounded-md bg-accent"
                  />
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-1">
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
                      className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-border transition-shadow hover:ring-foreground/30"
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
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Iniciar sesión</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Registrarse</Button>
                  </Link>
                </>
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
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.path) ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-3 border-t border-border/70 pt-3">
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
