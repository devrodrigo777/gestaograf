import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Importar cliente Supabase para autenticação OAuth com Google
import { supabase } from '@/lib/supabaseClient';

/**
 * Componente de Login
 * 
 * Responsabilidades:
 * - Exibir botão para login com Google
 * - Sincronizar sessão do Supabase com o estado da aplicação
 * - Redirecionar usuário autenticado para o Dashboard
 */
export default function Login() {
  const navigate = useNavigate();
  // Acessar função para sincronizar usuário Supabase com o store
  const { setSupabaseUser } = useStore();
  
  // Estados para gerenciar autenticação
  const [user, setUser] = useState(null); // Usuário autenticado
  const [error, setError] = useState(''); // Mensagens de erro
  const [isLoading, setIsLoading] = useState(false); // Loading durante login

  // useEffect 1: Sincronizar sessão ao carregar a página
  useEffect(() => {
    // Verificar se já existe uma sessão ativa do Supabase
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Se há sessão, atualizar estado local e do Zustand
        setUser(session.user);
        setSupabaseUser(session.user);
        console.log("Sessão recuperada via getSession");
      }
    };

    checkSession();

    // Escutar mudanças de autenticação em tempo real
    // Isso detecta login/logout de qualquer aba do navegador
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Sincronizar usuário com o store Zustand
        await setSupabaseUser(session.user);
      }
    });

    // Limpar subscription ao desmontar o componente
    return () => subscription?.unsubscribe();
  }, [setSupabaseUser]);

  // useEffect 2: Redirecionar para dashboard quando usuário estiver autenticado
  // Separado do anterior para evitar navegação duplicada
  useEffect(() => {
    if (user) {
      console.log("Usuário detectado, redirecionando...", user);
      navigate('/dashboard');
    }
  }, [user, navigate]);

  /**
   * Iniciar login com Google via Supabase OAuth
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    // Chamar método de login OAuth do Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google', // Usar Google como provedor
      options: {
        // Redirecionar para home após autenticação bem-sucedida
        redirectTo: window.location.origin + '/',
      }
    });

    if (error) {
      setError('Erro ao fazer login com Google: ' + error.message);
      setIsLoading(false);
      console.log("Erro do login Google: " + error);
    }
    // Nota: O loading permanece ativo durante redirecionamento
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">GestãoGraf</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestão Gráfica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mostrar erro se houver */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Instruções para o usuário */}
          <div className="text-center text-gray-600 mb-4">
            <p>Faça login com sua conta Google para continuar</p>
          </div>

          {/* Botão para login com Google */}
          <Button
            type="button"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar com Google'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
