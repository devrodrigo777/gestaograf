import { createClient } from '@supabase/supabase-js';

/**
 * Inicializar Cliente Supabase
 * 
 * Este arquivo configura a instância do cliente Supabase
 * que será usada em toda a aplicação para:
 * - Autenticação (OAuth com Google)
 * - Requisições à API REST
 * - Gerenciamento de sessão
 */

// Importar URLs e chaves das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Criar instância do cliente Supabase
 * 
 * Parâmetros:
 * - supabaseUrl: URL única do seu projeto Supabase
 * - supabaseAnonKey: Chave anônima para requisições não autenticadas
 * 
 * Exportar para usar em: Login.tsx, ProtectedRoute.tsx, App.tsx, Sidebar.tsx
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);