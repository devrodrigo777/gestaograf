import { supabase } from '@/lib/supabaseClient';
import { Service } from '@/types';

/**
 * Obter todos os serviços de uma empresa
 */
export async function getServicesFromSupabase(): Promise<Service[]> {
  try {
    // Obter o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

    // Obter a empresaid do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios_autorizados')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (userError || !userData) throw new Error('Empresa não encontrada');

    // Buscar serviços da empresa
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('empresa_id', userData.id)
      .order('criado_em', { ascending: false });
    
    if (error) throw error;

    // Mapear dados do Supabase para o tipo Service
    return data.map((service: any) => ({
      id: service.id,
      companyId: service.empresa_id,
      name: service.nome,
      description: service.descricao ?? undefined,
      price: service.preco,
      createdAt: service.criado_em,
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error);
    return [];
  }
}

/**
 * Criar novo serviço
 */
export async function createServiceInSupabase(service: Service): Promise<Service | null> {
  try {
    // Obter o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');

    // Obter a empresaid do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios_autorizados')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (userError || !userData) throw new Error('Empresa não encontrada');

    // Inserir serviço
    const { data, error } = await supabase
      .from('servicos')
      .insert({
        empresa_id: userData.id,
        nome: service.name,
        descricao: service.description || null,
        preco: service.price,
      })
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      description: data.descricao ?? undefined,
      price: data.preco,
      createdAt: data.criadoem,
    };
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error);
    return null;
  }
}

/**
 * Atualizar serviço existente
 */
export async function updateServiceInSupabase(
  serviceId: string,
  updates: Partial<Service>
): Promise<Service | null> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.name !== undefined) updateData.nome = updates.name;
    if (updates.description !== undefined) updateData.descricao = updates.description || null;
    if (updates.price !== undefined) updateData.preco = updates.price;

    const { data, error } = await supabase
      .from('servicos')
      .update(updateData)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) throw error;

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      description: data.descricao ?? undefined,
      price: data.preco,
      createdAt: data.criado_em,
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error);
    return null;
  }
}

/**
 * Deletar serviço
 */
export async function deleteServiceFromSupabase(serviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar serviço:', error);
    return false;
  }
}