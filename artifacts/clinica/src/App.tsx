import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Consulta from "@/pages/consulta";
import Clientes from "@/pages/clientes";
import Servicos from "@/pages/servicos";
import Agendamentos from "@/pages/agendamentos";
import LoginPage from "@/pages/login";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/clientes" component={Clientes} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/agendamento" component={Agendamentos} />
        <Route path="/consulta" component={Consulta} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppContent() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
