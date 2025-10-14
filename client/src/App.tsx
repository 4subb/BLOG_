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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ingenieria" component={Engineering} />
      <Route path="/deportes" component={Sports} />
      <Route path="/viajes" component={Travel} />
      <Route path="/post/:id" component={PostDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

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
