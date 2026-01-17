import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/types';

/**
 * Serviço para operações CRUD de clientes no Supabase
 */

/**
 * Obter todos os clientes de uma empresa (usando o email do usuário)
 */
export async function getClientsFromSupabase(): Promise<Client[]> {
  try {
    // Obter o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Obter a empresa_id do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios_autorizados')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      throw new Error('Empresa do usuário não encontrada');
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', userData.id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    // Mapear dados do Supabase para o tipo Client da aplicação
    return (data || []).map((client: any) => ({
      id: client.id,
      companyId: client.empresa_id,
      name: client.nome,
      email: client.email || undefined,
      phone: client.telefone,
      address: client.endereco || undefined,
      cpfCnpj: client.cpf_cnpj || undefined,
      createdAt: client.criado_em,
    }));
  } catch (error) {
    console.error('Erro no serviço de clientes:', error);
    return [];
  }
}

/**
 * Obter todos os clientes de uma empresa pelo empresa_id (versão legada)
 */
export async function getClientsFromSupabaseByEmpresaId(empresaId: string): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }

    // Mapear dados do Supabase para o tipo Client da aplicação
    return (data || []).map((client: any) => ({
      id: client.id,
      companyId: client.empresa_id,
      name: client.nome,
      email: client.email || undefined,
      phone: client.telefone,
      address: client.endereco || undefined,
      cpfCnpj: client.cpf_cnpj || undefined,
      createdAt: client.criado_em,
    }));
  } catch (error) {
    console.error('Erro no serviço de clientes:', error);
    return [];
  }
}

/**
 * Criar novo cliente
 */
export async function createClientInSupabase(client: Client): Promise<Client | null> {
  try {
    // Obter o ID do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Obter a empresa_id do usuário da tabela usuarios_autorizados
    const { data: userData, error: userError } = await supabase
      .from('usuarios_autorizados')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      throw new Error('Empresa do usuário não encontrada');
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([
        {
          empresa_id: userData.id,
          nome: client.name,
          email: client.email || null,
          telefone: client.phone,
          endereco: client.address || null,
          cpf_cnpj: client.cpfCnpj || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      email: data.email || undefined,
      phone: data.telefone,
      address: data.endereco || undefined,
      cpfCnpj: data.cpf_cnpj || undefined,
      createdAt: data.criado_em,
    };
  } catch (error) {
    console.error('Erro no serviço de criação de cliente:', error);
    return null;
  }
}

/**
 * Atualizar cliente existente
 */
export async function updateClientInSupabase(
  clientId: string,
  updates: Partial<Client>
): Promise<Client | null> {
  try {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.nome = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.phone !== undefined) updateData.telefone = updates.phone;
    if (updates.address !== undefined) updateData.endereco = updates.address || null;
    if (updates.cpfCnpj !== undefined) updateData.cpf_cnpj = updates.cpfCnpj || null;

    updateData.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      email: data.email || undefined,
      phone: data.telefone,
      address: data.endereco || undefined,
      cpfCnpj: data.cpf_cnpj || undefined,
      createdAt: data.criado_em,
    };
  } catch (error) {
    console.error('Erro no serviço de atualização de cliente:', error);
    return null;
  }
}

/**
 * Deletar cliente
 */
export async function deleteClientFromSupabase(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro no serviço de deleção de cliente:', error);
    return false;
  }
}
