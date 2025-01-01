import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Quotes from "./pages/Quotes";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public tracking page - no layout */}
          <Route path="/acompanhar/:id" element={<TrackOrder />} />
          
          {/* Admin pages with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/servicos" element={<Services />} />
                <Route path="/orcamentos" element={<Quotes />} />
                <Route path="/vendas" element={<Sales />} />
                <Route path="/relatorios" element={<Reports />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
