import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { useState } from "react";
// Importamos isAdmin también
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Obtenemos 'isAdmin' del contexto
  const { user, isAuthenticated, isLoading, logout, isAdmin } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all duration-300">
            <div className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Blog
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  size="sm"
                  className="transition-all duration-300"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Búsqueda Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
            </div>
          </form>

          {/* --- ZONA DE USUARIO (DESKTOP) --- */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {isLoading ? (
              <Button variant="ghost" size="sm" disabled>Cargando...</Button>
            ) : isAuthenticated ? (
              <>
                {/* 2. AVATAR Y USERNAME (Con enlace al perfil) */}
                <Link href="/profile">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 group-hover:ring-2 group-hover:ring-primary transition-all">
                      <img 
                        src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Mostramos Username si existe, si no el email */}
                    <span className="text-sm font-medium group-hover:text-primary transition-colors hidden lg:block">
                      {user?.username || user?.email?.split('@')[0]}
                    </span>
                  </div>
                </Link>

                {/* 3. BOTÓN PANEL DE CONTROL (Solo si es Admin) */}
                {isAdmin && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Panel</Button>
                  </Link>
                )}

                <Button variant="outline" size="sm" onClick={handleLogout}>Salir</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Iniciar Sesión</Button></Link>
                <Link href="/register"><Button variant="default" size="sm">Registrarse</Button></Link>
              </>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <Button variant="ghost" size="icon" className="md:hidden ml-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* --- MENÚ MÓVIL --- */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
              </div>
            </form>
            
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button variant={location === item.path ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="border-t pt-3 mt-3 space-y-1">
              {isLoading ? (
                <Button variant="ghost" className="w-full justify-start" disabled>Cargando...</Button>
              ) : isAuthenticated ? (
                <>
                  {/* Perfil en Móvil */}
                  <Link href="/profile">
                    <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                          <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium">{user?.username || user?.email}</span>
                    </div>
                  </Link>
                  
                  {/* Panel Admin en Móvil (Protegido) */}
                  {isAdmin && (
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-primary font-bold" onClick={() => setMobileMenuOpen(false)}>
                        Panel de Control
                      </Button>
                    </Link>
                  )}

                  <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login"><Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Button></Link>
                  <Link href="/register"><Button variant="default" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>Registrarse</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}