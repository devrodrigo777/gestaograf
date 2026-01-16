import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

/**
 * Página de Status
 * 
 * Responsabilidades:
 * - Mostrar informações do usuário autenticado
 * - Testar conexão com Supabase
 * - Exibir status das configurações
 */
const Status = () => {
  // Acessar usuário Supabase do store
  const { supabaseUser } = useStore();
  
  // Estados para controlar teste de conexão
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar se Supabase está habilitado via variável de ambiente
  const supabaseEnabled = import.meta.env.VITE_SUPABASE_ENABLED === 'true';

  /**
   * Testar conexão com Supabase
   * 
   * Faz uma requisição GET para a API REST do Supabase
   * para verificar se a conexão está funcionando
   */
  const testSupabaseConnection = async () => {
    setConnectionStatus('loading');
    setErrorMessage('');

    try {
      // Obter credenciais das variáveis de ambiente
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Validar se as credenciais estão configuradas
      if (!supabaseUrl || !supabaseAnonKey) {
        setConnectionStatus('error');
        setErrorMessage('Variáveis de ambiente do Supabase não configuradas corretamente.');
        return;
      }

      // Fazer requisição GET para verificar conexão com Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      // Se conseguir conectar ao servidor (200 OK ou 404 Not Found)
      // significa que a conexão está funcionando
      if (response.ok || response.status === 404) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro desconhecido ao conectar ao Supabase'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div>
        <h1 className="text-3xl font-bold">Status do Sistema</h1>
        <p className="text-gray-600 mt-2">Verifique a conectividade do seu sistema</p>
      </div>

      {/* Mostrar informações do usuário autenticado */}
      {supabaseUser && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Usuário Logado</CardTitle>
            {/* Badge verde indicando autenticação ativa */}
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Autenticado
            </span>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* Email do usuário */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{supabaseUser.email}</span>
            </div>
            {/* Nome do usuário (pode vir de Google) */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Nome:</span>
              <span className="font-medium">{supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Não informado'}</span>
            </div>
            {/* ID único do usuário no Supabase */}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ID do Usuário:</span>
              <span className="font-medium text-xs text-gray-500">{supabaseUser.id}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de status do Supabase */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>Supabase</CardTitle>
          </div>
          {/* Badge indicando se Supabase está ativado ou desativado */}
          {supabaseEnabled ? (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              Ativado
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Desativado
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descrição do status */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {supabaseEnabled
                ? 'O Supabase está habilitado. O sistema está usando o banco de dados remoto.'
                : 'O Supabase está desabilitado. O sistema pode estar usando dados locais.'}
            </p>
          </div>

          {/* Testes de conexão - Apenas se Supabase estiver ativado */}
          {supabaseEnabled && (
            <div className="space-y-4">
              {/* Estado inicial - Nenhum teste foi feito */}
              {connectionStatus === 'idle' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Clique no botão abaixo para testar a conexão com o Supabase.
                  </AlertDescription>
                </Alert>
              )}

              {/* Aguardando resposta do teste */}
              {connectionStatus === 'loading' && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Testando conexão com Supabase...</AlertDescription>
                </Alert>
              )}

              {/* Conexão bem-sucedida */}
              {connectionStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✓ Conexão com Supabase estabelecida com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              {/* Erro na conexão */}
              {connectionStatus === 'error' && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    ✗ Erro ao conectar ao Supabase: {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botão para testar conexão */}
              <Button
                onClick={testSupabaseConnection}
                disabled={connectionStatus === 'loading'}
                className="w-full"
              >
                {connectionStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Conexão'
                )}
              </Button>
            </div>
          )}

          {/* Mensagem se Supabase não estiver configurado */}
          {!supabaseEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Configure as variáveis de ambiente no arquivo .env para habilitar o Supabase.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card de informações de configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {/* Status do Supabase */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Supabase Habilitado:</span>
              <span className="font-medium">{supabaseEnabled ? 'Sim' : 'Não'}</span>
            </div>
            {/* URL configurada */}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">URL do Supabase:</span>
              <span className="font-medium text-gray-500">
                {import.meta.env.VITE_SUPABASE_URL ? '✓ Configurado' : '✗ Não configurado'}
              </span>
            </div>
            {/* Chave anônima configurada */}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Chave Anônima:</span>
              <span className="font-medium text-gray-500">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurado' : '✗ Não configurado'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;
