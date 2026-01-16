import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ProductionStatus } from '@/types';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Clock, 
  Hammer, 
  Sparkles, 
  Package, 
  Truck,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusSteps: { status: ProductionStatus; label: string; icon: React.ElementType }[] = [
  { status: 'waiting_approval', label: 'Aguardando Aprovação', icon: Clock },
  { status: 'approved', label: 'Aprovado', icon: CheckCircle2 },
  { status: 'in_production', label: 'Em Produção', icon: Hammer },
  { status: 'finishing', label: 'Acabamento', icon: Sparkles },
  { status: 'ready', label: 'Pronto para Retirada', icon: Package },
  { status: 'delivered', label: 'Entregue', icon: Truck },
];

function getStatusIndex(status: ProductionStatus): number {
  return statusSteps.findIndex(s => s.status === status);
}

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();
  const { quotes } = useStore();
  
  const quote = quotes.find(q => q.id === id);
  
  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Orçamento não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O link pode estar incorreto ou o orçamento foi removido.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(quote.productionStatus);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar-bg text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-sidebar-header flex items-center justify-center">
              <span className="text-xl">🖨️</span>
            </div>
            <h1 className="text-xl font-semibold">Gráfica Express</h1>
          </div>
          <p className="text-sidebar-text text-sm">Acompanhamento de Pedido</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Order Info */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8 animate-fade-in">
          <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Orçamento Nº</p>
              <p className="text-lg font-bold text-foreground">{quote.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{quote.clientName}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Data do Orçamento</p>
              <p className="text-foreground">{format(new Date(quote.createdAt), 'dd/MM/yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-xl font-bold text-primary">
                R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-6">Status do Pedido</h2>
          
          <div className="relative">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                  {/* Line */}
                  <div className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isCompleted 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground",
                        isCurrent && "ring-4 ring-primary/20"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={cn(
                          "w-0.5 flex-1 mt-2",
                          index < currentStatusIndex ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="pt-2">
                    <p 
                      className={cn(
                        "font-medium",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-primary mt-1">← Status atual</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-lg border border-border p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-4">Itens do Orçamento</h2>
          
          <div className="divide-y divide-border">
            {quote.items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border mt-4 pt-4 flex justify-between">
            <p className="font-semibold text-foreground">Total</p>
            <p className="font-bold text-lg text-primary">
              R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Payments */}
        {quote.payments && quote.payments.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 mt-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pagamentos Registrados</h2>
            
            <div className="space-y-3 mb-6">
              {quote.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {payment.method === 'cash' && 'Dinheiro'}
                      {payment.method === 'credit' && 'Cartão de Crédito'}
                      {payment.method === 'debit' && 'Cartão de Débito'}
                      {payment.method === 'pix' && 'PIX'}
                      {payment.method === 'boleto' && 'Boleto'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Já Pago:</p>
                <p className="font-semibold text-green-600">
                  R$ {quote.payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Faltando:</p>
                <p className="font-semibold text-orange-600">
                  R$ {Math.max(0, quote.total - quote.payments.reduce((acc, p) => acc + p.amount, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {(() => {
                const totalPaid = quote.payments.reduce((acc, p) => acc + p.amount, 0);
                const difference = totalPaid - quote.total;
                if (difference > 0) {
                  return (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <p className="text-muted-foreground font-semibold">Diferença (Excedente):</p>
                      <p className="font-semibold text-blue-600">
                        +R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}
        {quote.notes && (
          <div className="bg-card rounded-lg border border-border p-6 mt-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-2">Observações</h2>
            <p className="text-muted-foreground">{quote.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Gráfica Express - Sistema de Gestão</p>
          <p>Dúvidas? Entre em contato conosco!</p>
        </div>
      </main>
    </div>
  );
}
