import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types';

/**
 * Serviço para operações CRUD de produtos no Supabase
 */

/**
 * Obter todos os produtos de uma empresa (usando o email do usuário)
 */
export async function getProductsFromSupabase(): Promise<Product[]> {
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
      .from('produtos')
      .select('*')
      .eq('empresa_id', userData.id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }

    // Mapear dados do Supabase para o tipo Product da aplicação
    return (data || []).map((product: any) => ({
      id: product.id,
      companyId: product.empresa_id,
      name: product.nome,
      description: product.descricao,
      price: product.preco,
      category: product.categoria,
      measurementUnit: product.unidade_medida,
      createdAt: product.criado_em,
    }));
  } catch (error) {
    console.error('Erro no serviço de produtos:', error);
    return [];
  }
}

/**
 * Criar novo produto
 */
export async function createProductInSupabase(product: Product): Promise<Product | null> {
  try {
    // Obter o usuário autenticado
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
      .from('produtos')
      .insert([
        {
          empresa_id: userData.id,
          nome: product.name,
          descricao: product.description,
          preco: product.price,
          categoria: product.category,
          unidade_medida: product.measurementUnit,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      description: data.descricao,
      price: data.preco,
      category: data.categoria,
      measurementUnit: data.unidade_medida,
      createdAt: data.criado_em,
    };
  } catch (error) {
    console.error('Erro no serviço de criação de produto:', error);
    return null;
  }
}

/**
 * Atualizar produto existente
 */
export async function updateProductInSupabase(
  productId: string,
  updates: Partial<Product>
): Promise<Product | null> {
  try {
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.nome = updates.name;
    if (updates.description !== undefined) updateData.descricao = updates.description;
    if (updates.price !== undefined) updateData.preco = updates.price;
    if (updates.category !== undefined) updateData.categoria = updates.category;
    if (updates.measurementUnit !== undefined) updateData.unidade_medida = updates.measurementUnit;

    updateData.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase
      .from('produtos')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }

    return {
      id: data.id,
      companyId: data.empresa_id,
      name: data.nome,
      description: data.descricao,
      price: data.preco,
      category: data.categoria,
      measurementUnit: data.unidade_medida,
      createdAt: data.criado_em,
    };
  } catch (error) {
    console.error('Erro no serviço de atualização de produto:', error);
    return null;
  }
}

/**
 * Deletar produto
 */
export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erro no serviço de deleção de produto:', error);
    return false;
  }
}
