import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ClientesList from "./pages/ClientesList";
import ClienteNovo from "./pages/ClienteNovo";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import OrdensList from "./pages/OrdensList";
import OrdemNova from "./pages/OrdemNova";
import OrdemDetalhe from "./pages/OrdemDetalhe";
import Agenda from "./pages/Agenda";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<ClientesList />} />
              <Route path="/clientes/novo" element={<ClienteNovo />} />
              <Route path="/clientes/:id" element={<ClienteDetalhe />} />
              <Route path="/ordens" element={<OrdensList />} />
              <Route path="/ordens/nova" element={<OrdemNova />} />
              <Route path="/ordens/:id" element={<OrdemDetalhe />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
