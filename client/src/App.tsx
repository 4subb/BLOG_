import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Engineering from "@/pages/Engineering";
import Sports from "@/pages/Sports";
import Travel from "@/pages/Travel";
import PostDetail from "@/pages/PostDetail";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import RegisterPage from "@/pages/Register";
import { Redirect } from "wouter";
import { useAuth } from "./context/AuthContext";
import EditPostPage from "@/pages/EditPost";


function Router() {
  // 2. ¡LLAMAMOS AL CEREBRO GLOBAL!
  // Obtenemos el estado de carga y si el usuario es admin
  const { isLoading, isAdmin } = useAuth();

  // 3. PANTALLA DE CARGA
  // Mientras el AuthContext está llamando a /api/auth/me,
  // mostramos un mensaje. Esto evita "parpadeos".
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando sesión...
      </div>
    );
  }

  // 4. EL MAPA (ahora consciente del rol)
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ingenieria" component={Engineering} />
      <Route path="/deportes" component={Sports} />
      <Route path="/viajes" component={Travel} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* 5. ¡LA RUTA PROTEGIDA! */}
      <Route path="/dashboard">
        {/* Esto se llama "render prop". Es un ternario:
            ¿El usuario es Admin? 
            (SÍ) -> Muéstrale el Dashboard.
            (NO) -> Redirígelo a la página de inicio.
        */}
        {isAdmin ? <DashboardPage /> : <Redirect to="/" />}
      </Route>
      
      {/* ¡AÑADE ESTA RUTA PROTEGIDA! */}
      {/* Usamos ':id' para que la ruta sea dinámica */}
      <Route path="/post/:id/edit">
        {isAdmin ? <EditPostPage /> : <Redirect to="/" />}
      </Route>

      {/* Esta siempre debe ser la última */}
      <Route component={NotFound} />
    </Switch>
  );
}

// ... (Tu función App() se queda igual)
// function App() { ... }
// export default App;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
