import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Service, Client, Quote, Sale, User, Company } from '@/types';

interface Store {
  // Auth
  user: User | null;
  company: Company | null;
  users: User[];
  companies: Company[];
  
  products: Product[];
  services: Service[];
  clients: Client[];
  quotes: Quote[];
  sales: Sale[];
  dismissedActivityIds: string[];
  
  // Auth Methods
  login: (username: string, password: string, companyName: string) => boolean;
  logout: () => void;
  registerUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  
  // Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProducts: () => Product[];
  
  // Services
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServices: () => Service[];
  
  // Clients
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClients: () => Client[];
  
  // Quotes
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addPaymentToQuote: (quoteId: string, amount: number, method: any) => void;
  removePaymentFromQuote: (quoteId: string, paymentId: string) => void;
  convertQuoteToSale: (quoteId: string, paymentMethod: Sale['paymentMethod']) => void;
  getQuotes: () => Quote[];
  // Activities dismissal
  dismissActivity: (id: string) => void;
  restoreActivity: (id: string) => void;
  
  // Sales
  addSale: (sale: Sale) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSales: () => Sale[];
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Auth initial state
      user: null,
      company: null,
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

      products: [],
      services: [],
      clients: [],
      quotes: [],
      sales: [],
      dismissedActivityIds: [],

      // Auth Methods
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

      logout: () => set({ user: null, company: null }),

      registerUser: (user) => {
        set((state) => ({
          users: [...state.users, user]
        }));
      },

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
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      getProducts: () => {
        const state = get();
        if (!state.company) return [];
        return state.products.filter(p => p.companyId === state.company!.id);
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
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, client) => set((state) => ({
        clients: state.clients.map((c) => c.id === id ? { ...c, ...client } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      })),
      getClients: () => {
        const state = get();
        if (!state.company) return [];
        return state.clients.filter(c => c.companyId === state.company!.id);
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
