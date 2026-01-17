import { supabase } from '@/lib/supabaseClient';
import { Sale, QuoteItem } from '@/types';

/**
 * Obter todas as vendas de uma empresa
 */
export async function getSalesFromSupabase(): Promise<Sale[]> {
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
    
    if (userError || !userData) throw new Error('Empresa não encontrada');

    // Buscar vendas da empresa
    const { data: salesData, error: salesError } = await supabase
      .from('vendas')
      .select('*')
      .eq('empresa_id', userData.id)
      .order('criado_em', { ascending: false });
    
    if (salesError) throw salesError;

    console.log('🔍 Vendas do banco:', salesData);

    // Para cada venda, buscar itens
    const sales: Sale[] = await Promise.all(
      salesData.map(async (sale: any) => {
        // Buscar itens da venda
        const { data: itemsData, error: itemsError } = await supabase
          .from('vendas_itens')
          .select('*')
          .eq('venda_id', sale.id);
        
        if (itemsError) throw itemsError;

        // Mapear itens
        const items: QuoteItem[] = itemsData.map((item: any) => ({
          id: item.id,
          productId: item.produto_id ?? undefined,
          serviceId: item.servico_id ?? undefined,
          name: item.nome,
          quantity: parseFloat(item.quantidade),
          width: item.largura ? parseFloat(item.largura) : undefined,
          height: item.altura ? parseFloat(item.altura) : undefined,
          unitPrice: parseFloat(item.preco_unitario),
          total: parseFloat(item.total),
        }));

        // Mapear venda
        return {
          id: sale.id,
          companyId: sale.empresa_id,
          clientId: sale.cliente_id,
          clientName: sale.cliente_nome,
          clientPhone: sale.cliente_telefone,
          items,
          total: parseFloat(sale.total),
          paymentMethod: sale.metodo_pagamento,
          status: sale.status,
          productionStatus: sale.status_producao,
          createdAt: sale.criado_em,
          deliveryDate: sale.data_entrega ?? undefined,
          quoteId: sale.orcamento_id ?? undefined,
        };
      })
    );

    console.log('✅ Vendas carregadas:', sales);
    return sales;
  } catch (error) {
    console.error('❌ Erro ao buscar vendas:', error);
    return [];
  }
}

/**
 * Criar nova venda
 */
export async function createSaleInSupabase(sale: Sale): Promise<Sale | null> {
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
    
    if (userError || !userData) throw new Error('Empresa não encontrada');

    // 1. Inserir venda
    const { data: saleData, error: saleError } = await supabase
      .from('vendas')
      .insert({
        empresa_id: userData.id,
        cliente_id: sale.clientId,
        cliente_nome: sale.clientName,
        cliente_telefone: sale.clientPhone,
        total: sale.total,
        metodo_pagamento: sale.paymentMethod,
        status: sale.status,
        status_producao: sale.productionStatus,
        data_entrega: sale.deliveryDate || null,
        orcamento_id: sale.quoteId || null,
      })
      .select()
      .single();
    
    if (saleError) throw saleError;

    // 2. Inserir itens da venda
    if (sale.items.length > 0) {
      const itemsToInsert = sale.items.map(item => ({
        venda_id: saleData.id,
        produto_id: item.productId || null,
        servico_id: item.serviceId || null,
        nome: item.name,
        quantidade: item.quantity,
        largura: item.width || null,
        altura: item.height || null,
        preco_unitario: item.unitPrice,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('vendas_itens')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }

    // 3. Buscar a venda completa criada
    const createdSale = await getSaleByIdFromSupabase(saleData.id);
    
    console.log('✅ Venda criada:', createdSale);
    return createdSale;
  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    return null;
  }
}

/**
 * Atualizar venda existente
 */
export async function updateSaleInSupabase(
  saleId: string,
  updates: Partial<Sale>
): Promise<Sale | null> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.clientId !== undefined) updateData.cliente_id = updates.clientId;
    if (updates.clientName !== undefined) updateData.cliente_nome = updates.clientName;
    if (updates.clientPhone !== undefined) updateData.cliente_telefone = updates.clientPhone;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.paymentMethod !== undefined) updateData.metodo_pagamento = updates.paymentMethod;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.productionStatus !== undefined) updateData.status_producao = updates.productionStatus;
    if (updates.deliveryDate !== undefined) updateData.data_entrega = updates.deliveryDate;

    const { error } = await supabase
      .from('vendas')
      .update(updateData)
      .eq('id', saleId);
    
    if (error) throw error;

    // Se os itens foram atualizados, recriar
    if (updates.items) {
      // Deletar itens antigos
      await supabase
        .from('vendas_itens')
        .delete()
        .eq('venda_id', saleId);

      // Inserir novos itens
      if (updates.items.length > 0) {
        const itemsToInsert = updates.items.map(item => ({
          venda_id: saleId,
          produto_id: item.productId || null,
          servico_id: item.serviceId || null,
          nome: item.name,
          quantidade: item.quantity,
          largura: item.width || null,
          altura: item.height || null,
          preco_unitario: item.unitPrice,
          total: item.total,
        }));

        await supabase
          .from('vendas_itens')
          .insert(itemsToInsert);
      }
    }

    const updatedSale = await getSaleByIdFromSupabase(saleId);
    console.log('✅ Venda atualizada:', updatedSale);
    return updatedSale;
  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    return null;
  }
}

/**
 * Deletar venda
 */
export async function deleteSaleFromSupabase(saleId: string): Promise<boolean> {
  try {
    // O CASCADE vai deletar automaticamente os itens
    const { error } = await supabase
      .from('vendas')
      .delete()
      .eq('id', saleId);
    
    if (error) throw error;
    
    console.log('✅ Venda deletada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar venda:', error);
    return false;
  }
}

/**
 * Buscar venda por ID (helper interno)
 */
async function getSaleByIdFromSupabase(saleId: string): Promise<Sale | null> {
  try {
    const { data: saleData, error: saleError } = await supabase
      .from('vendas')
      .select('*')
      .eq('id', saleId)
      .single();
    
    if (saleError) throw saleError;

    // Buscar itens
    const { data: itemsData, error: itemsError } = await supabase
      .from('vendas_itens')
      .select('*')
      .eq('venda_id', saleId);
    
    if (itemsError) throw itemsError;

    const items: QuoteItem[] = itemsData.map((item: any) => ({
      id: item.id,
      productId: item.produto_id ?? undefined,
      serviceId: item.servico_id ?? undefined,
      name: item.nome,
      quantity: parseFloat(item.quantidade),
      width: item.largura ? parseFloat(item.largura) : undefined,
      height: item.altura ? parseFloat(item.altura) : undefined,
      unitPrice: parseFloat(item.preco_unitario),
      total: parseFloat(item.total),
    }));

    return {
      id: saleData.id,
      companyId: saleData.empresa_id,
      clientId: saleData.cliente_id,
      clientName: saleData.cliente_nome,
      clientPhone: saleData.cliente_telefone,
      items,
      total: parseFloat(saleData.total),
      paymentMethod: saleData.metodo_pagamento,
      status: saleData.status,
      productionStatus: saleData.status_producao,
      createdAt: saleData.criado_em,
      deliveryDate: saleData.data_entrega ?? undefined,
      quoteId: saleData.orcamento_id ?? undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar venda por ID:', error);
    return null;
  }
}
