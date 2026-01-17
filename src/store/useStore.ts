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
  
  // ==================== MÉTODOS DE CLIENTES ====================
  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClients: () => Client[];
  loadClients: () => Promise<void>;
  
  // ==================== MÉTODOS DE ORÇAMENTOS ====================
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addPaymentToQuote: (quoteId: string, amount: number, method: any) => void;
  removePaymentFromQuote: (quoteId: string, paymentId: string) => void;
  convertQuoteToSale: (quoteId: string, paymentMethod: Sale['paymentMethod']) => void;
  getQuotes: () => Quote[];
  
  // ==================== MÉTODOS DE ATIVIDADES ====================
  dismissActivity: (id: string) => void; // Descartar atividade
  restoreActivity: (id: string) => void; // Restaurar atividade
  
  // ==================== MÉTODOS DE VENDAS ====================
  addSale: (sale: Sale) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSales: () => Sale[];
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
      setSupabaseUser: (supabaseUser) => {
        // Extrair informações do usuário Supabase
        const email = supabaseUser.email || '';
        const displayName = supabaseUser.user_metadata?.full_name || 
                           supabaseUser.user_metadata?.name || 
                           email.split('@')[0]; // Usar parte do email como fallback
        
        // Criar usuário local baseado no Supabase
        const user: User = {
          id: supabaseUser.id, // Use ID do Supabase
          username: displayName,
          email: email,
          password: '', // Não usado com Supabase (autenticação é via OAuth)
          companyId: '1', // Usar companyId padrão
          createdAt: new Date().toISOString(),
          empresa: supabaseUser.user_metadata?.empresa || 'Minha Empresa', // Recuperar coluna empresa
        };

        // Atualizar store com novo usuário
        set({ supabaseUser, user, company: get().companies[0] || null });
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
      addService: (service) => set((state) => ({ services: [...state.services, service] })),
      updateService: (id, service) => set((state) => ({
        services: state.services.map((s) => s.id === id ? { ...s, ...service } : s)
      })),
      deleteService: (id) => set((state) => ({
        services: state.services.filter((s) => s.id !== id)
      })),
      getServices: () => {
        const state = get();
        if (!state.company) return [];
        return state.services.filter(s => s.companyId === state.company!.id);
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
      addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, quote] })),
      // Update a quote and propagate productionStatus to related sales when changed
      updateQuote: (id, quote) => set((state) => {
        const updatedQuotes = state.quotes.map((q) => q.id === id ? { ...q, ...quote } : q);
        const updatedQuote = updatedQuotes.find(q => q.id === id);
        let updatedSales = state.sales;
        if (updatedQuote && quote.productionStatus !== undefined) {
          updatedSales = state.sales.map(s => s.quoteId === id ? { ...s, productionStatus: updatedQuote.productionStatus } : s);
        }
        return {
          ...state,
          quotes: updatedQuotes,
          sales: updatedSales,
        };
      }),
      deleteQuote: (id) => set((state) => ({
        quotes: state.quotes.filter((q) => q.id !== id)
      })),
      addPaymentToQuote: (quoteId, amount, method) => set((state) => ({
        quotes: state.quotes.map((q) => {
          if (q.id === quoteId) {
            const newPayment = {
              id: crypto.randomUUID(),
              amount,
              method,
              createdAt: new Date().toISOString(),
            };
            return {
              ...q,
              payments: [...(q.payments || []), newPayment],
            };
          }
          return q;
        }),
      })),
      removePaymentFromQuote: (quoteId, paymentId) => set((state) => ({
        quotes: state.quotes.map((q) => {
          if (q.id === quoteId) {
            return {
              ...q,
              payments: (q.payments || []).filter((p) => p.id !== paymentId),
            };
          }
          return q;
        }),
      })),
      convertQuoteToSale: (quoteId, paymentMethod) => {
        const state = get();
        const quote = state.quotes.find(q => q.id === quoteId);
        if (!quote) return;

        // Converter status do orçamento para status da venda
        let saleStatus: Sale['status'] = 'pending';
        if (quote.status === 'fully_paid') {
          saleStatus = 'paid';
        } else if (quote.status === 'pending') {
          saleStatus = 'pending';
        } else if (quote.status === 'partially_paid') {
          saleStatus = 'pending';
        }

        const sale: Sale = {
          id: crypto.randomUUID(),
          companyId: quote.companyId,
          clientId: quote.clientId,
          clientName: quote.clientName,
          quoteId: quote.id,
          items: quote.items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            serviceId: item.serviceId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          total: quote.total,
          paymentMethod,
          status: saleStatus,
          productionStatus: quote.productionStatus,
          deliveryDate: quote.deliveryDate,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          quotes: state.quotes.map(q => q.id === quoteId ? { ...q, status: 'converted' as const } : q),
          sales: [...state.sales, sale],
        }));
      },
      getQuotes: () => {
        const state = get();
        if (!state.company) return [];
        return state.quotes.filter(q => q.companyId === state.company!.id);
      },

      // Sales
      addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
      // Update a sale and, if it references a quote, propagate productionStatus back to the quote
      updateSale: (id, sale) => set((state) => {
        const updatedSales = state.sales.map((s) => s.id === id ? { ...s, ...sale } : s);
        const updatedSale = updatedSales.find(s => s.id === id);
        let updatedQuotes = state.quotes;
        if (updatedSale && updatedSale.quoteId && sale.productionStatus !== undefined) {
          updatedQuotes = state.quotes.map(q => q.id === updatedSale.quoteId ? { ...q, productionStatus: updatedSale.productionStatus } : q);
        }
        return {
          ...state,
          sales: updatedSales,
          quotes: updatedQuotes,
        };
      }),

      // Activities dismissal
      dismissActivity: (id) => set((state) => ({ dismissedActivityIds: Array.from(new Set([...state.dismissedActivityIds, id])) })),
      restoreActivity: (id) => set((state) => ({ dismissedActivityIds: state.dismissedActivityIds.filter(i => i !== id) })),
      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter((s) => s.id !== id)
      })),
      getSales: () => {
        const state = get();
        if (!state.company) return [];
        return state.sales.filter(s => s.companyId === state.company!.id);
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
