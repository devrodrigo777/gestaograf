import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useStore } from '@/store/useStore';
import { Users, Package, Calculator, ShoppingCart, BarChart, Activity, Truck, Hammer } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { startStripeCheckout } from '@/services/stripeService';
import { toast } from 'sonner';
import { set } from 'date-fns';

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
  
  // if (!session) {
  //   console.log("sessão inválida.");
  //   //return <Navigate to="/login" replace />;
  // }

  // Estados para controlar verificação de autenticação
  const [isLoading, setIsLoading] = useState(true); // Verificando sessão?
  const [isLoadingPayment, setIsLoadingPayment] = useState(false); // Iniciando checkout?
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Está logado?
  const [isAuthorized, setIsAuthorized] = useState(false); // Está autorizado  a acessar o sistema?

  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // Verificar autenticação ao carregar o componente
    const checkAuth = async () => {

      const query = new URLSearchParams(window.location.search);
      if (query.get('success')) {
        toast.success("Assinatura confirmada! Agradecemos por escolher o GestãoGraf!");
        // Limpa a URL
        window.history.replaceState({}, document.title, "/dashboard");
      }

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

        } else {
          setIsAuthenticated(false);
          setIsAuthorized(false);

          // Deslogar se não houver sessão
          logout();
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
          <h1 className="text-2xl font-bold text-orange-400 mb-4 mt-4">Seja bem-vindo(a)!</h1>
          <p className="text-lg text-orange-400">Seu e-mail <strong>ainda</strong> não está autorizado a utilizar o sistema.</p>
          <p className="text-lg text-orange-400 mb-4">Para continuar, pedimos que confirme sua assinatura.</p>
          <div className="my-8 text-left max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Veja o que o GestãoGraf oferece</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-orange-500" />
                <span>Gestão de Clientes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-orange-500" />
                <span>Controle de Produtos e Serviços</span>
              </li>
              <li className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-orange-500" />
                <span>Criação de Orçamentos</span>
              </li>
              <li className="flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <span>Registro de Vendas</span>
              </li>
              <li className="flex items-center space-x-3">
                <BarChart className="w-5 h-5 text-orange-500" />
                <span>Relatórios de Desempenho</span>
              </li>
              <li className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <span>Acompanhamento de Atividades</span>
              </li>
              <li className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-orange-500" />
                <span>Rastreamento de Pedidos para Clientes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Hammer className="w-5 h-5 text-orange-500" />
                <span>Suporte e Melhorias</span>
              </li>
            </ul>
          </div>

          <div className="my-4">
            <p className="text-lg text-orange-600 mb-4">Tudo isso por apenas:</p>
            <p className="text-5xl font-bold text-orange-600">
              R$ 15,90
              <span className="text-xl font-normal text-orange-500">/mês</span>
            </p>
          </div>
          <button 
            onClick={async () => {

              setIsLoadingPayment(true); // 1. Ativa o loading imediatamente
              try {
                await startStripeCheckout("price_1Sqeuu1j1yZi8xwBMnuy5SBj"); 
              } catch (error) {
                setIsLoadingPayment(false); // 2. Desativa se der erro (para o usuário tentar de novo)
              }
            }}

            // 1. O disabled deve ser baseado no estado de loading
            disabled={isLoadingPayment} 
            className={`
              text-white font-bold py-3 px-6 rounded text-xl shadow-lg mb-5 transition-all
              ${isLoadingPayment 
                ? 'bg-gray-500 cursor-not-allowed opacity-70' // Estilo quando está carregando
                : 'bg-orange-500 hover:bg-orange-600 animate-pulse' // Estilo quando está ativo
              }
            `}
          >
            {isLoadingPayment ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando...
              </span>
            ) : (
              'Assine Agora!'
            )}
          </button>
          <hr/>
          {/* <p className="text-lg text-red-600 mb-4"><a href="https://api.whatsapp.com/send?phone=5571935009519&text=Olá,%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20de%20gestão%20gráficas." target="_blank" className="text-primary underline hover:text-primary/90">ou Fale Comigo no Whatsapp!</a></p> */}
          <p className="text-lg text-orange-600 mb-4 mt-4">Feito com ❤️ por Rodrigo Lopes - <a href="https://www.linkedin.com/in/rodrigolca/" className="text-primary underline hover:text-primary/90">Linkedin</a></p>
          <p className="text-lg text-orange-600 mb-4">
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
  else {
    // Se autenticado, renderizar as rotas protegidas
    return <>{children}</>;
  }
}
