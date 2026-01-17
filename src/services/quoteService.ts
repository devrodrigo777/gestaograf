import { supabase } from '@/lib/supabaseClient';
import { Quote, QuoteItem, Payment } from '@/types';

/**
 * Obter todos os orçamentos de uma empresa
 */
export async function getQuotesFromSupabase(): Promise<Quote[]> {
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

    // Buscar orçamentos da empresa
    const { data: quotesData, error: quotesError } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('empresa_id', userData.id)
      .order('criado_em', { ascending: false });
    
    if (quotesError) throw quotesError;

    // Para cada orçamento, buscar itens e pagamentos
    const quotes: Quote[] = await Promise.all(
      quotesData.map(async (quote: any) => {
        // Buscar itens do orçamento
        const { data: itemsData, error: itemsError } = await supabase
          .from('orcamentos_itens')
          .select('*')
          .eq('orcamento_id', quote.id);
        
        if (itemsError) throw itemsError;

        // Buscar pagamentos do orçamento
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('orcamentos_pagamentos')
          .select('*')
          .eq('orcamento_id', quote.id);
        
        if (paymentsError) throw paymentsError;

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

        // Mapear pagamentos
        const payments: Payment[] = paymentsData.map((payment: any) => ({
          id: payment.id,
          amount: parseFloat(payment.valor),
          method: payment.metodo,
          createdAt: payment.criado_em,
        }));

        // Mapear orçamento
        return {
          id: quote.id,
          companyId: quote.empresa_id,
          clientId: quote.cliente_id,
          clientName: quote.cliente_nome,
          clientPhone: quote.cliente_telefone,
          items,
          total: parseFloat(quote.total),
          payments,
          status: quote.status,
          productionStatus: quote.status_producao,
          validUntil: quote.valido_ate,
          createdAt: quote.criado_em,
          notes: quote.observacoes ?? undefined,
          deliveryDate: quote.data_entrega ?? undefined,
        };
      })
    );

    console.log('✅ Orçamentos carregados:', quotes);
    return quotes;
  } catch (error) {
    console.error('❌ Erro ao buscar orçamentos:', error);
    return [];
  }
}

/**
 * Criar novo orçamento
 */
export async function createQuoteInSupabase(quote: Quote): Promise<Quote | null> {
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

    // 1. Inserir orçamento
    const { data: quoteData, error: quoteError } = await supabase
      .from('orcamentos')
      .insert({
        empresa_id: userData.id,
        cliente_id: quote.clientId,
        cliente_nome: quote.clientName,
        cliente_telefone: quote.clientPhone,
        total: quote.total,
        status: quote.status,
        status_producao: quote.productionStatus,
        valido_ate: quote.validUntil,
        data_entrega: quote.deliveryDate || null,
        observacoes: quote.notes || null,
      })
      .select()
      .single();
    
    if (quoteError) throw quoteError;

    // 2. Inserir itens do orçamento
    if (quote.items.length > 0) {
      const itemsToInsert = quote.items.map(item => ({
        orcamento_id: quoteData.id,
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
        .from('orcamentos_itens')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }

    // 3. Buscar o orçamento completo criado
    const createdQuote = await getQuoteByIdFromSupabase(quoteData.id);
    
    console.log('✅ Orçamento criado:', createdQuote);
    return createdQuote;
  } catch (error) {
    console.error('❌ Erro ao criar orçamento:', error);
    return null;
  }
}

/**
 * Atualizar orçamento existente
 */
export async function updateQuoteInSupabase(
  quoteId: string,
  updates: Partial<Quote>
): Promise<Quote | null> {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.clientId !== undefined) updateData.cliente_id = updates.clientId;
    if (updates.clientName !== undefined) updateData.cliente_nome = updates.clientName;
    if (updates.clientPhone !== undefined) updateData.cliente_telefone = updates.clientPhone;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.productionStatus !== undefined) updateData.status_producao = updates.productionStatus;
    if (updates.validUntil !== undefined) updateData.valido_ate = updates.validUntil;
    if (updates.deliveryDate !== undefined) updateData.data_entrega = updates.deliveryDate;
    if (updates.notes !== undefined) updateData.observacoes = updates.notes;

    const { error } = await supabase
      .from('orcamentos')
      .update(updateData)
      .eq('id', quoteId);
    
    if (error) throw error;

    // Se os itens foram atualizados, recriar
    if (updates.items) {
      // Deletar itens antigos
      await supabase
        .from('orcamentos_itens')
        .delete()
        .eq('orcamento_id', quoteId);

      // Inserir novos itens
      if (updates.items.length > 0) {
        const itemsToInsert = updates.items.map(item => ({
          orcamento_id: quoteId,
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
          .from('orcamentos_itens')
          .insert(itemsToInsert);
      }
    }

    const updatedQuote = await getQuoteByIdFromSupabase(quoteId);
    console.log('✅ Orçamento atualizado:', updatedQuote);
    return updatedQuote;
  } catch (error) {
    console.error('❌ Erro ao atualizar orçamento:', error);
    return null;
  }
}

/**
 * Deletar orçamento
 */
export async function deleteQuoteFromSupabase(quoteId: string): Promise<boolean> {
  try {
    // O CASCADE vai deletar automaticamente itens e pagamentos
    const { error } = await supabase
      .from('orcamentos')
      .delete()
      .eq('id', quoteId);
    
    if (error) throw error;
    
    console.log('✅ Orçamento deletado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar orçamento:', error);
    return false;
  }
}

/**
 * Adicionar pagamento a um orçamento
 */
export async function addPaymentToQuoteInSupabase(
  quoteId: string,
  amount: number,
  method: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orcamentos_pagamentos')
      .insert({
        orcamento_id: quoteId,
        valor: amount,
        metodo: method,
      });
    
    if (error) throw error;
    
    console.log('✅ Pagamento adicionado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar pagamento:', error);
    return false;
  }
}

/**
 * Remover pagamento de um orçamento
 */
export async function removePaymentFromQuoteInSupabase(
  paymentId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orcamentos_pagamentos')
      .delete()
      .eq('id', paymentId);
    
    if (error) throw error;
    
    console.log('✅ Pagamento removido');
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover pagamento:', error);
    return false;
  }
}

/**
 * Buscar orçamento por ID (helper interno)
 */
async function getQuoteByIdFromSupabase(quoteId: string): Promise<Quote | null> {
  try {
    const { data: quoteData, error: quoteError } = await supabase
      .from('orcamentos')
      .select('*')
      .eq('id', quoteId)
      .single();
    
    if (quoteError) throw quoteError;

    // Buscar itens
    const { data: itemsData, error: itemsError } = await supabase
      .from('orcamentos_itens')
      .select('*')
      .eq('orcamento_id', quoteId);
    
    if (itemsError) throw itemsError;

    // Buscar pagamentos
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('orcamentos_pagamentos')
      .select('*')
      .eq('orcamento_id', quoteId);
    
    if (paymentsError) throw paymentsError;

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

    const payments: Payment[] = paymentsData.map((payment: any) => ({
      id: payment.id,
      amount: parseFloat(payment.valor),
      method: payment.metodo,
      createdAt: payment.criado_em,
    }));

    return {
      id: quoteData.id,
      companyId: quoteData.empresa_id,
      clientId: quoteData.cliente_id,
      clientName: quoteData.cliente_nome,
      clientPhone: quoteData.cliente_telefone,
      items,
      total: parseFloat(quoteData.total),
      payments,
      status: quoteData.status,
      productionStatus: quoteData.status_producao,
      validUntil: quoteData.valido_ate,
      createdAt: quoteData.criado_em,
      notes: quoteData.observacoes ?? undefined,
      deliveryDate: quoteData.data_entrega ?? undefined,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar orçamento por ID:', error);
    return null;
  }
}
