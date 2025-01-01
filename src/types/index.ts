export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  cpfCnpj?: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ProductionStatus = 
  | 'waiting_approval'
  | 'approved'
  | 'in_production'
  | 'finishing'
  | 'ready'
  | 'delivered';

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  items: QuoteItem[];
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  productionStatus: ProductionStatus;
  validUntil: string;
  createdAt: string;
  notes?: string;
}

export interface SaleItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  quoteId?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix' | 'boleto';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}
