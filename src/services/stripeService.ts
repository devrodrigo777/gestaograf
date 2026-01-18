import { supabase } from '@/lib/supabaseClient';

export const startStripeCheckout = async (priceId: string) => {
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    // Sem sessão válida, não pode continuar
    // Redirecionaremos para /login
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId }
  });

  if (error) {
    // Tenta ler a mensagem de erro retornada pela função
    const errorMessage = await error.context?.json();
    console.error("Erro detalhado da Function:", errorMessage);
    throw error;
  }

  if (data?.url) {
    window.location.href = data.url;
  }
};

export const cancelSubscription = async () => {
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase.functions.invoke('create-portal-link');

  if (error) {
    console.error("Erro ao chamar portal:", error);
    throw error;
  }

  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error('Link do portal não gerado');
  }

  return { success: true };
};