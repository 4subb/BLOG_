import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import LanguageToggle from "@/components/LanguageToggle";

// --- TUS PÁGINAS ---
import NotFound from "@/pages/not-found";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import Engineering from "@/pages/Engineering";
import Sports from "@/pages/Sports";
import Travel from "@/pages/Travel";
import PostDetails from "@/pages/PostDetail";

// --- IMPORTANTE: Importamos los archivos ESPECÍFICOS ---
import LoginPage from "@/pages/Login";     
import RegisterPage from "@/pages/Register"; 

import DashboardPage from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile"; 

function Router() {
  return (
    <Switch>
      {/* 1. Rutas Públicas */}
      <Route path="/" component={Portfolio} />
      <Route path="/blog" component={Blog} />
      <Route path="/ingenieria" component={Engineering} />
      <Route path="/deportes" component={Sports} />
      <Route path="/viajes" component={Travel} />
      
      {/* 2. Ruta de Post Individual */}
      <Route path="/post/:id" component={PostDetails} />
      
      {/* 3. RUTAS DE ACCESO (AQUÍ ESTABA EL ERROR) */}
      {/* Forzamos que /login use LoginPage y /register use RegisterPage */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Si alguien va a /auth, lo mandamos al login por defecto */}
      <Route path="/auth" component={LoginPage} />
      
      {/* 4. Rutas Privadas */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      
      {/* 5. Error 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageToggle />
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;