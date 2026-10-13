import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";
import { pageVariants } from "@/lib/motion";

// --- TUS PÁGINAS ---
import NotFound from "@/pages/not-found";
import AcademicProfile from "@/pages/AcademicProfile";
import Home from "@/pages/Home";
import Engineering from "@/pages/Engineering";
import Sports from "@/pages/Sports";
import Travel from "@/pages/Travel";
import Reading from "@/pages/Reading";
import Gallery from "@/pages/Gallery";
import PostDetails from "@/pages/PostDetail";

// --- IMPORTANTE: Importamos los archivos ESPECÍFICOS ---
import LoginPage from "@/pages/Login";     
import RegisterPage from "@/pages/Register"; 

import DashboardPage from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile"; 

import EditPostPage from "@/pages/EditPost";

function Router({ location }: { location: string }) {
  return (
    <Switch location={location}>
      {/* 1. Rutas Públicas */}
      <Route path="/" component={Home} />
      <Route path="/academico" component={AcademicProfile} />
      <Route path="/ingenieria" component={Engineering} />
      <Route path="/deportes" component={Sports} />
      <Route path="/viajes" component={Travel} />
      <Route path="/lectura" component={Reading} />
      <Route path="/galeria" component={Gallery} />
      
      {/*  CORRECCIÓN: Rutas dinámicas ESPECÍFICAS van primero */}
      <Route path="/post/:id/edit" component={EditPostPage} />
      
      {/* 2. Ruta de Post Individual (El comodín va después) */}
      <Route path="/post/:id" component={PostDetails} />
      
      {/* 3. RUTAS DE ACCESO */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
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
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user": respeta "reducir movimiento" del sistema operativo */}
      <MotionConfig reducedMotion="user">
        <AppLayout>
          {/* mode="wait": la página saliente termina su exit antes de montar la nueva.
              Al terminar el exit subimos el scroll, así la nueva página siempre entra arriba. */}
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
            <motion.div
              key={location}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="flex flex-1 flex-col"
            >
              <Router location={location} />
            </motion.div>
          </AnimatePresence>
        </AppLayout>
        <Toaster />
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
