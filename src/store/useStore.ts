import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Service, Client, Quote, Sale } from '@/types';

interface Store {
  products: Product[];
  services: Service[];
  clients: Client[];
  quotes: Quote[];
  sales: Sale[];
  
  // Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Services
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Clients
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Quotes
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  convertQuoteToSale: (quoteId: string, paymentMethod: Sale['paymentMethod']) => void;
  
  // Sales
  addSale: (sale: Sale) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      products: [],
      services: [],
      clients: [],
      quotes: [],
      sales: [],

      // Products
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...product } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),

      // Services
      addService: (service) => set((state) => ({ services: [...state.services, service] })),
      updateService: (id, service) => set((state) => ({
        services: state.services.map((s) => s.id === id ? { ...s, ...service } : s)
      })),
      deleteService: (id) => set((state) => ({
        services: state.services.filter((s) => s.id !== id)
      })),

      // Clients
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, client) => set((state) => ({
        clients: state.clients.map((c) => c.id === id ? { ...c, ...client } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id)
      })),

      // Quotes
      addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, quote] })),
      updateQuote: (id, quote) => set((state) => ({
        quotes: state.quotes.map((q) => q.id === id ? { ...q, ...quote } : q)
      })),
      deleteQuote: (id) => set((state) => ({
        quotes: state.quotes.filter((q) => q.id !== id)
      })),
      convertQuoteToSale: (quoteId, paymentMethod) => {
        const quote = get().quotes.find(q => q.id === quoteId);
        if (!quote) return;

        const sale: Sale = {
          id: crypto.randomUUID(),
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
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          quotes: state.quotes.map(q => q.id === quoteId ? { ...q, status: 'converted' as const } : q),
          sales: [...state.sales, sale],
        }));
      },

      // Sales
      addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
      updateSale: (id, sale) => set((state) => ({
        sales: state.sales.map((s) => s.id === id ? { ...s, ...sale } : s)
      })),
      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter((s) => s.id !== id)
      })),
    }),
    {
      name: 'grafica-erp-storage',
    }
  )
);
