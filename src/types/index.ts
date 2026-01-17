export type MeasurementUnit = 'unit' | 'm2' | 'linear_meter';

// Authentication Types
export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
  companyId: string;
  createdAt: string;
  empresa?: string; // Coluna empresa do banco de dados
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  isLogged: boolean;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  measurementUnit: MeasurementUnit;
  createdAt: string;
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  cpfCnpj?: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'boleto';

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  quantity: number;
  width?: number;
  height?: number;
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
  companyId: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  items: QuoteItem[];
  total: number;
  payments: Payment[];
  status: 'pending' | 'approved' | 'rejected' | 'converted' | 'partially_paid' | 'fully_paid';
  productionStatus: ProductionStatus;
  validUntil: string;
  createdAt: string;
  deliveryDate?: string;
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
  companyId: string;
  clientId: string;
  clientName: string;
  quoteId?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix' | 'boleto';
  status: 'pending' | 'paid' | 'cancelled';
  productionStatus?: ProductionStatus;
  deliveryDate?: string;
  createdAt: string;
}
