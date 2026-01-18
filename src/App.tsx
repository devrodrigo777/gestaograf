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
import Status from "./pages/Status";
import Subscription from "./pages/Subscription";
import LandingPage from "./pages/LandingPage";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabaseClient";

// Configurar React Query para gerenciamento de cache
const queryClient = new QueryClient();

/**
 * Componente Principal da Aplicação
 * 
 * Responsabilidades:
 * - Configurar providers (QueryClient, Tooltip, Toaster)
 * - Sincronizar sessão Supabase com o estado global (Zustand)
 * - Definir rotas da aplicação
 * - Proteger rotas que requerem autenticação
 */
const App = () => {
  // Acessar função para sincronizar usuário Supabase
  const { setSupabaseUser } = useStore();

  // useEffect: Sincronizar sessão do Supabase com o store na inicialização
  useEffect(() => {
    /**
     * Verificar se há uma sessão Supabase ativa
     * e sincronizar com o store da aplicação
     */
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Se há sessão, sincronizar usuário com o Zustand
        setSupabaseUser(session.user);
      }
    };

    checkSession();

    /**
     * Escutar mudanças de autenticação em tempo real
     * Detecta login/logout de qualquer aba ou dispositivo
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Sincronizar usuário com o store quando autenticação mudar
        setSupabaseUser(session.user);
      }
    });

    // Limpar subscription ao desmontar o componente
    return () => subscription?.unsubscribe();
  }, [setSupabaseUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Notificação tipo toast (canto inferior) */}
        <Toaster />
        {/* Notificação tipo Sonner */}
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            {/* Rota de Landing Page - Pública */}
            <Route path="/" element={<LandingPage />} />

            {/* Rota de Login - Pública, sem layout */}
            <Route path="/login" element={<Login />} />
            
            {/* Rota de Rastreamento - Pública, sem layout de admin */}
            <Route path="/acompanhar/:id" element={<TrackOrder />} />
            
            {/* Rotas Protegidas - Requerem autenticação */}
            <Route path="/*" element={
              <ProtectedRoute>
                {/* Layout contém Sidebar e estrutura principal */}
                <Layout>
                  <Routes>
                    {/* Dashboard - Home da aplicação */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Gerenciamento de Dados */}
                    <Route path="/clientes" element={<Clients />} />
                    <Route path="/produtos" element={<Products />} />
                    <Route path="/servicos" element={<Services />} />
                    
                    {/* Vendas e Orçamentos */}
                    <Route path="/orcamentos" element={<Quotes />} />
                    <Route path="/vendas" element={<Sales />} />
                    
                    {/* Operações */}
                    <Route path="/atividades" element={<Activities />} />
                    <Route path="/relatorios" element={<Reports />} />
                    
                    {/* Configurações */}
                    <Route path="/status" element={<Status />} />
                    <Route path="/configuracoes" element={<Settings />} />
                    <Route path="/assinatura" element={<Subscription />} />
                    
                    {/* Página padrão para rotas não encontradas */}
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
};

export default App;
