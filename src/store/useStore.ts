import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Service, Client, Quote, Sale, User, Company } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import {
  getClientsFromSupabase,
  createClientInSupabase,
  updateClientInSupabase,
  deleteClientFromSupabase,
} from '@/services/clientService';
import {
  getProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
} from '@/services/productService';
import {
  getServicesFromSupabase,
  createServiceInSupabase,
  updateServiceInSupabase,
  deleteServiceFromSupabase,
} from '@/services/serviceService';
import {
  getQuotesFromSupabase,
  createQuoteInSupabase,
  updateQuoteInSupabase,
  deleteQuoteFromSupabase,
  addPaymentToQuoteInSupabase,
  removePaymentFromQuoteInSupabase,
} from '@/services/quoteService';
import {
  getSalesFromSupabase,
  createSaleInSupabase,
  updateSaleInSupabase,
  deleteSaleFromSupabase,
} from '@/services/saleService';

/**
 * Interface Store
 * 
 * Define todos os estados e funções disponíveis no Zustand store.
 * O store gerencia:
 * - Autenticação (usuário local e Supabase)
 * - Produtos, Serviços, Clientes
 * - Orçamentos e Vendas
 * - Atividades descartadas
 */
interface Store {
  // ==================== AUTENTICAÇÃO ====================
  user: User | null; // Usuário local autenticado
  company: Company | null; // Empresa selecionada
  supabaseUser: any | null; // Usuário autenticado via Supabase/Google
  users: User[]; // Lista de usuários locais (dados de teste)
  companies: Company[]; // Lista de empresas locais (dados de teste)
  
  // ==================== DADOS ====================
  products: Product[];
  services: Service[];
  clients: Client[];
  quotes: Quote[];
  sales: Sale[];
  dismissedActivityIds: string[]; // IDs de atividades descartadas
  
  // ==================== MÉTODOS DE AUTENTICAÇÃO ====================
  login: (username: string, password: string, companyName: string) => boolean;
  logout: () => Promise<void>;
  // Sincronizar usuário Supabase com o store
  setSupabaseUser: (user: any) => void;
  registerUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  
  // ==================== MÉTODOS DE PRODUTOS ====================
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProducts: () => Product[];
  loadProducts: () => Promise<void>;
  // ==================== MÉTODOS DE SERVIÇOS ====================
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServices: () => Service[];
  loadServices: () => Promise<void>;
  
  // ==================== MÉTODOS DE CLIENTES ====================
  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClients: () => Client[];
  loadClients: () => Promise<void>;
  
  // ==================== MÉTODOS DE ORÇAMENTOS ====================
  addQuote: (quote: Quote) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  loadQuotes: () => Promise<void>;
  addPaymentToQuote: (quoteId: string, amount: number, method: any) => Promise<void>;
  removePaymentFromQuote: (quoteId: string, paymentId: string) => Promise<void>;
  convertQuoteToSale: (quoteId: string, paymentMethod: Sale['paymentMethod']) => Promise<void>;
  getQuotes: () => Quote[];
  
  // ==================== MÉTODOS DE ATIVIDADES ====================
  dismissActivity: (id: string) => void; // Descartar atividade
  restoreActivity: (id: string) => void; // Restaurar atividade
  
  // ==================== MÉTODOS DE VENDAS ====================
  addSale: (sale: Sale) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSales: () => Sale[];
  loadSales: () => Promise<void>;
}

/**
 * Zustand Store
 * 
 * Gerenciamento de estado global com persistência local.
 * Usa localStorage para salvar dados entre sessões.
 */
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ==================== ESTADO INICIAL DE AUTENTICAÇÃO ====================
      user: null,
      company: null,
      supabaseUser: null,
      
      // Dados de teste locais (usados se Supabase não estiver disponível)
      users: [
        {
          id: '1',
          username: 'admin',
          password: 'admin',
          email: 'admin@admin.com',
          companyId: '1',
          createdAt: new Date().toISOString(),
        }
      ],
      companies: [
        {
          id: '1',
          name: 'admin',
          createdAt: new Date().toISOString(),
        }
      ],

      // Estados iniciais para dados vazios
      products: [],
      services: [],
      clients: [],
      quotes: [],
      sales: [],
      dismissedActivityIds: [],

      // ==================== MÉTODOS DE AUTENTICAÇÃO ====================
      
      /**
       * Login com credenciais locais (legado)
       * Nota: Atualmente não usado, mantido para compatibilidade
       */
      login: (username, password, companyName) => {
        const company = get().companies.find(c => c.name === companyName);
        if (!company) return false;

        const user = get().users.find(
          u => u.username === username && u.password === password && u.companyId === company.id
        );

        if (!user) return false;

        set({ user, company });
        return true;
      },

      /**
       * Logout - Limpar todos os dados de autenticação
       */
      logout: async () => {
        try {
          // 1. Encerra a sessão no servidor do Supabase
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Erro ao sair do Supabase:", error);
        } finally {
          // 2. Limpa os estados locais (mesmo se o signOut der erro)
          set({ 
            user: null, 
            company: null, 
            supabaseUser: null 
          });

          // 3. Opcional: Redireciona para o login ou recarrega a página para limpar o cache
          window.location.href = '/login';
        }
      },

      /**
       * Sincronizar usuário Supabase com o store
       * Converte dados do Supabase para o formato local da aplicação
       */
      setSupabaseUser: async (supabaseUser) => {
        try {
        // Extrair informações do usuário Supabase
        const email = supabaseUser.email || '';
        const displayName = supabaseUser.user_metadata?.full_name || 
                          supabaseUser.user_metadata?.name || 
                          email.split('@')[0];
        
        // ✅ BUSCAR A EMPRESA DO USUÁRIO NO BANCO
        const { data: userData, error } = await supabase
          .from('usuarios_autorizados')
          .select('id, empresa')
          .eq('email', email)
          .single();
        
        if (error || !userData) {
          console.error('❌ Erro ao buscar empresa do usuário:', error);
          throw new Error('Empresa não encontrada para este usuário');
        }

        console.log('✅ Empresa encontrada:', userData);

        // Criar usuário local baseado no Supabase
        const user: User = {
          id: supabaseUser.id,
          username: displayName,
          email: email,
          password: '',
          companyId: userData.id, // ✅ Usar o ID real da tabela usuarios_autorizados
          createdAt: new Date().toISOString(),
          empresa: userData.empresa || 'Minha Empresa',
        };

        // Criar objeto Company
        const company: Company = {
          id: userData.id, // ✅ UUID real da empresa
          name: userData.empresa || 'Minha Empresa',
          createdAt: new Date().toISOString(),
        };

        // Salvar no estado
        set({ 
          user, 
          company, // ✅ Salvar company também
          supabaseUser,
        });

        console.log('✅ Usuário e empresa salvos:', { user, company });
      } catch (error) {
        console.error('❌ Erro ao configurar usuário:', error);
        throw error;
      }
      },

      /**
       * Registrar novo usuário local (legado)
       */
      registerUser: (user) => {
        set((state) => ({
          users: [...state.users, user]
        }));
      },

      /**
       * Atualizar dados do usuário autenticado
       */
      updateUser: (user) => set((state) => {
        if (!state.user) return state;
        const updatedUser = { ...state.user, ...user };
        return {
          ...state,
          user: updatedUser,
          users: state.users.map(u => u.id === state.user!.id ? updatedUser : u),
        };
      }),

      // Products
      addProduct: async (product) => {
        const createdProduct = await createProductInSupabase(product);
        if (createdProduct) {
          set((state) => ({ products: [...state.products, createdProduct] }));
        }
      },
      updateProduct: async (id, product) => {
        const updatedProduct = await updateProductInSupabase(id, product);
        if (updatedProduct) {
          set((state) => ({
            products: state.products.map((p) => p.id === id ? updatedProduct : p)
          }));
        }
      },
      deleteProduct: async (id) => {
        const success = await deleteProductFromSupabase(id);
        if (success) {
          set((state) => ({
            products: state.products.filter((p) => p.id !== id)
          }));
        }
      },
      getProducts: () => {
        const state = get();
        if (!state.company) return [];
        return state.products.filter(p => p.companyId === state.company!.id);
      },
      loadProducts: async () => {
        const products = await getProductsFromSupabase();
        set({ products });
      },

      // Services
      // addService: (service) => set((state) => ({ services: [...state.services, service] })),
      addService: async (service) => {
        const createdService = await createServiceInSupabase(service);
        if (createdService) {
          set((state) => ({ services: [...state.services, createdService] }));
        }
      },

      updateService: async (id, service) => {
        const updatedService = await updateServiceInSupabase(id, service);
        if (updatedService) {
          set((state) => ({
            services: state.services.map((s) => s.id === id ? updatedService : s)
          }));
        }
      },
      deleteService: async (id) => {
        const success = await deleteServiceFromSupabase(id);
        if (success) {
          set((state) => ({
            services: state.services.filter((s) => s.id !== id)
          }));
        }
      },
      getServices: () => {
        const state = get();
        if (!state.company) return [];
        return state.services.filter(s => s.companyId === state.company!.id);
      },

      loadServices: async () => {
        const services = await getServicesFromSupabase();
        set({ services });
      },

      // Clients
      addClient: async (client) => {
        const createdClient = await createClientInSupabase(client);
        if (createdClient) {
          set((state) => ({ clients: [...state.clients, createdClient] }));
        }
      },
      updateClient: async (id, client) => {
        const updatedClient = await updateClientInSupabase(id, client);
        if (updatedClient) {
          set((state) => ({
            clients: state.clients.map((c) => c.id === id ? updatedClient : c)
          }));
        }
      },
      deleteClient: async (id) => {
        const success = await deleteClientFromSupabase(id);
        if (success) {
          set((state) => ({
            clients: state.clients.filter((c) => c.id !== id)
          }));
        }
      },
      getClients: () => {
        const state = get();
        if (!state.company) return [];
        return state.clients.filter(c => c.companyId === state.company!.id);
      },
      loadClients: async () => {
        const clients = await getClientsFromSupabase();
        set({ clients });
      },

      // Quotes
    addQuote: async (quote) => {
      const createdQuote = await createQuoteInSupabase(quote);
      if (createdQuote) {
        set((state) => ({ quotes: [...state.quotes, createdQuote] }));
      }
    },

    updateQuote: async (id, quote) => {
      const updatedQuote = await updateQuoteInSupabase(id, quote);
      if (updatedQuote) {
        set((state) => ({
          quotes: state.quotes.map((q) => (q.id === id ? updatedQuote : q)),
        }));
      }
    },

    deleteQuote: async (id) => {
      const success = await deleteQuoteFromSupabase(id);
      if (success) {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        }));
      }
    },

    getQuotes: () => {
      const state = get();
      if (!state.company) return [];
      return state.quotes.filter((q) => q.companyId === state.company!.id);
    },

    // 
    loadQuotes: async () => {
      const quotes = await getQuotesFromSupabase();
      set({ quotes });
    },

    addPaymentToQuote: async (quoteId, amount, method) => {
      const success = await addPaymentToQuoteInSupabase(quoteId, amount, method);
      if (success) {
        // Recarregar orçamentos para atualizar os pagamentos
        const quotes = await getQuotesFromSupabase();
        set({ quotes });
      }
    },

    removePaymentFromQuote: async (quoteId, paymentId) => {
      const success = await removePaymentFromQuoteInSupabase(paymentId);
      if (success) {
        // Recarregar orçamentos para atualizar os pagamentos
        const quotes = await getQuotesFromSupabase();
        set({ quotes });
      }
    },

    convertQuoteToSale: async (quoteId, paymentMethod) => {
      // Buscar o orçamento
      const state = get();
      const quote = state.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      // Criar venda baseada no orçamento
      const sale = {
        id: crypto.randomUUID(),
        companyId: quote.companyId,
        clientId: quote.clientId,
        clientName: quote.clientName,
        clientPhone: quote.clientPhone,
        items: quote.items,
        total: quote.total,
        paymentMethod,
        status: 'paid' as const,
        productionStatus: quote.productionStatus,
        createdAt: new Date().toISOString(),
        deliveryDate: quote.deliveryDate,
        quoteId: quote.id,
      };

      // Adicionar venda
      const createdSale = await createSaleInSupabase(sale);
      if (createdSale) {
        set((state) => ({ sales: [...state.sales, createdSale] }));
        
        // Atualizar status do orçamento para convertido
        await updateQuoteInSupabase(quoteId, { status: 'converted' });
        
        // Recarregar orçamentos
        const quotes = await getQuotesFromSupabase();
        set({ quotes });
      }
    },

      // Sales
      addSale: async (sale) => {
        const createdSale = await createSaleInSupabase(sale);
        if (createdSale) {
          set((state) => ({ sales: [...state.sales, createdSale] }));
        }
      },

      updateSale: async (id, sale) => {
        const updatedSale = await updateSaleInSupabase(id, sale);
        if (updatedSale) {
          set((state) => ({
            sales: state.sales.map((s) => (s.id === id ? updatedSale : s)),
          }));
        }
      },

      // Activities dismissal
      dismissActivity: (id) => set((state) => ({ dismissedActivityIds: Array.from(new Set([...state.dismissedActivityIds, id])) })),
      restoreActivity: (id) => set((state) => ({ dismissedActivityIds: state.dismissedActivityIds.filter(i => i !== id) })),
      deleteSale: async (id) => {
        const success = await deleteSaleFromSupabase(id);
        if (success) {
          set((state) => ({
            sales: state.sales.filter((s) => s.id !== id),
          }));
        }
      },
      getSales: () => {
        const state = get();
        if (!state.company) return [];
        return state.sales.filter((s) => s.companyId === state.company!.id);
      },

      loadSales: async () => {
        const sales = await getSalesFromSupabase();
        set({ sales });
      },
    }),
    {
      name: 'grafica-erp-storage',
      migrate: (persistedState: any, version: number) => {
        // Limpar dados legados que não têm companyId
        if (persistedState) {
          // Remover vendas sem companyId (dados legados)
          if (persistedState.sales && Array.isArray(persistedState.sales)) {
            persistedState.sales = persistedState.sales.filter((s: any) => s.companyId);
          }
          // Remover clientes sem companyId
          if (persistedState.clients && Array.isArray(persistedState.clients)) {
            persistedState.clients = persistedState.clients.filter((c: any) => c.companyId);
          }
          // Remover produtos sem companyId
          if (persistedState.products && Array.isArray(persistedState.products)) {
            persistedState.products = persistedState.products.filter((p: any) => p.companyId);
          }
          // Remover serviços sem companyId
          if (persistedState.services && Array.isArray(persistedState.services)) {
            persistedState.services = persistedState.services.filter((s: any) => s.companyId);
          }
          // Remover orçamentos sem companyId
          if (persistedState.quotes && Array.isArray(persistedState.quotes)) {
            persistedState.quotes = persistedState.quotes.filter((q: any) => q.companyId);
          }
        }
        return persistedState;
      },
    }
  )
);
