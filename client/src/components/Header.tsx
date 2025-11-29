// Contenido NUEVO Y FUSIONADO para client/src/components/Header.tsx

import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // 1. ¡IMPORTAMOS NUESTRO HOOK!

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 2. ¡LLAMAMOS A NUESTRO HOOK DE AUTENTICACIÓN!
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Inicio" },
    { path: "/ingenieria", label: "Ingeniería" },
    { path: "/deportes", label: "Deportes" },
    { path: "/viajes", label: "Viajes y Fotografía" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  // 3. ¡CREAMOS EL MANEJADOR DE LOGOUT!
  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false); // Cierra el menú móvil si está abierto
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo del Blog */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all duration-300">
            <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent" data-testid="text-logo">
              Blog
            </div>
          </Link>

          {/* Navegación de Escritorio */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  size="sm"
                  className="transition-all duration-300"
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Formulario de Búsqueda (Escritorio) - Movido para dar espacio */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                id="search-desktop"
                name="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
                data-testid="input-search"
              />
            </div>
          </form>

          {/* 4. ¡AÑADIMOS LOS BOTONES DE AUTH (ESCRITORIO)! */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {isLoading ? (
              <Button variant="ghost" size="sm" disabled>Cargando...</Button>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden lg:block">Hola, {user?.email}</span>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Panel</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>


          {/* Botón de Menú Móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-auto" // Aseguramos que esté al final
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* 5. ¡AÑADIMOS LOS BOTONES DE AUTH (MÓVIL)! */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-in slide-in-from-top duration-200">
            
            {/* Búsqueda Móvil */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  id="search-mobile"
                  name="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                  data-testid="input-search-mobile"
                />
              </div>
            </form>
            
            {/* Navegación Móvil */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Separador y Auth Móvil */}
            <div className="border-t pt-3 mt-3 space-y-1">
              {isLoading ? (
                <Button variant="ghost" className="w-full justify-start" disabled>Cargando...</Button>
              ) : isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground px-4 py-2 block">Hola, {user?.email}</span>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      Panel de Control
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="default" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
          </div>
        )}
      </div>
    </header>
  );
}