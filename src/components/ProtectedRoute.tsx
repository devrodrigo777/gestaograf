import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/store/useStore';
import { is } from 'date-fns/locale';
import { subscribe } from 'diagnostics_channel';
import logoImg from '@/assets/logo.png';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente ProtectedRoute
 * 
 * Protege rotas verificando se o usuário está autenticado no Supabase.
 * Se não estiver autenticado, redireciona para /login.
 * 
 * Fluxo:
 * 1. Carrega: verifica sessão do Supabase
 * 2. Enquanto verifica: mostra loading screen
 * 3. Se autenticado: renderiza os children (Layout + rotas)
 * 4. Se não autenticado: redireciona para /login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Acessar usuário Supabase do store
  const { supabaseUser } = useStore();
  
  // Estados para controlar verificação de autenticação
  const [isLoading, setIsLoading] = useState(true); // Verificando sessão?
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Está logado?
  const [isAuthorized, setIsAuthorized] = useState(false); // Está autorizado  a acessar o sistema?

  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // Verificar autenticação ao carregar o componente
    const checkAuth = async () => {
      try {
        // Buscar sessão atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if(session?.user) {

          // Autenticado se houver sessão e usuário
          setIsAuthenticated(!!session?.user);

          // Consultaremos a tabela usuarios_autorizados
          const { data, error } = await supabase
            .from('usuarios_autorizados')
            .select('email, ativo')
            .eq('email', session.user.email)
            .eq('ativo', true)
            .single();

          if (data && !error) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }

        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
      } finally {
        // Terminar o loading em qualquer caso
        setIsLoading(false);
      }
    };
  
    checkAuth();

    // Escutar mudanças de autenticação (login/logout de outras abas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if(session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setIsAuthorized(false);
      }
    });

    // Limpar subscription ao desmontar
    return () => subscription?.unsubscribe();
  }, []);

  // Enquanto verifica autenticação, mostrar loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, redirecionar para login
  // Verificar ambas as condições: sessão Supabase e store
  if (!isAuthenticated && !supabaseUser) {
    return <Navigate to="/login" replace />;
  }

  if(!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-20 p-4">
        <div className="text-center">
          <img 
            src={logoImg} 
            alt="GestãoGraf Logo" 
            className="h-20 w-auto mx-auto" // Ajuste o tamanho aqui
          />
          <h1 className="text-2xl font-bold text-red-600 mb-4 mt-4">Acesso negado</h1>
          <p className="text-lg text-red-600 mb-4">Seu e-mail não está autorizado a utilizar o sistema (ainda).</p>
          <p className="text-lg text-red-600 mb-4"><a href="https://api.whatsapp.com/send?phone=5571935009519&text=Olá,%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20de%20gestão%20gráficas." target="_blank" className="text-primary underline hover:text-primary/90">Clique aqui para falar com o administrador pelo Whatsapp.</a></p>
          <p className="text-lg text-red-600 mb-4">Feito com ❤️ por Rodrigo Lopes - <a href="https://www.linkedin.com/in/rodrigolca/" className="text-primary underline hover:text-primary/90">Linkedin</a></p>
          <p className="text-lg text-red-600 mb-4">
            { /* Logout pra voltar pra pagina de login */ }
            <button
              onClick={() => logout()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Se autenticado, renderizar as rotas protegidas
  return <>{children}</>;
}
