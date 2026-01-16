import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Quotes from "./pages/Quotes";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Activities from "./pages/Activities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Public tracking page - no layout */}
          <Route path="/acompanhar/:id" element={<TrackOrder />} />
          
          {/* Protected admin pages with layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clients />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="/orcamentos" element={<Quotes />} />
                  <Route path="/atividades" element={<Activities />} />
                  <Route path="/vendas" element={<Sales />} />
                  <Route path="/relatorios" element={<Reports />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
