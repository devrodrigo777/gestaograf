import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Quote, ProductionStatus } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuoteForm } from '@/components/dashboard/QuoteForm';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { ArrowRightLeft, Send, Eye, Settings, Edit, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const BASE_URL = 'https://graficaexpress.com.br';

const productionStatusLabels: Record<ProductionStatus, string> = {
  waiting_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  in_production: 'Em Produção',
  finishing: 'Acabamento',
  ready: 'Pronto',
  delivered: 'Entregue',
};

export default function Quotes() {
  const { quotes: allQuotes, clients: allClients, company, addQuote, updateQuote, deleteQuote, convertQuoteToSale } = useStore();
  const quotes = allQuotes.filter(q => q.companyId === company?.id && q.status !== 'converted');
  const clients = allClients.filter(c => c.companyId === company?.id);

  const paidQuotes = quotes.filter(
    (q) => (q.status === 'fully_paid' || q.status === 'partially_paid')
  );

  const unpaidQuotes = quotes.filter(
    (q) => q.status !== 'fully_paid' && q.status !== 'partially_paid'
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [newProductionStatus, setNewProductionStatus] = useState<ProductionStatus>('waiting_approval');

  const statusLabels = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    converted: 'Convertido',
    partially_paid: 'Parcialmente Pago',
    fully_paid: 'Pago',
  };

  const statusColors = {
    pending: 'bg-badge-warning',
    approved: 'bg-badge-success',
    rejected: 'bg-badge-danger',
    converted: 'bg-badge-info',
    partially_paid: 'bg-badge-secondary',
    fully_paid: 'bg-green-200',
  };

  const statusTextColors = {
    pending: 'text-yellow-800',
    approved: 'text-green-800',
    rejected: 'text-red-800',
    converted: 'text-blue-800',
    partially_paid: 'text-gray-800',
    fully_paid: 'text-green-700',
  };

  const handleNew = () => {
    setEditingQuote(null);
    setIsFormOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setIsFormOpen(true);
  };

  const handleDelete = (quote: Quote) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteQuote(quote.id);
      toast.success('Orçamento excluído com sucesso!');
    }
  };

  const handleSaveQuote = (data: any) => {
    const { clientId, items, validDays, notes, deliveryDate } = data;
    
    if (!clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      toast.error('Cliente não encontrado');
      return;
    }
    
    const total = items.reduce((acc: number, item: any) => acc + item.total, 0);
    const validity = parseInt(validDays) || 30;

    if (editingQuote) {
      // Update existing quote
      const updatedQuote: Partial<Quote> = {
        clientId,
        clientName: client.name,
        clientPhone: client.phone,
        items,
        total,
        validUntil: addDays(new Date(editingQuote.createdAt), validity).toISOString(),
        notes,
        deliveryDate,
      };
      updateQuote(editingQuote.id, updatedQuote);
      toast.success('Orçamento atualizado com sucesso!');
    } else {
      const newQuote: Quote = {
        id: crypto.randomUUID(),
        companyId: company!.id,
        clientId: clientId,
        clientName: client.name,
        clientPhone: client.phone,
        items: items,
        total,
        payments: [],
        status: 'pending',
        productionStatus: 'waiting_approval',
        validUntil: addDays(new Date(), validity).toISOString(),
        createdAt: new Date().toISOString(),
        notes: notes,
        deliveryDate,
      };
      addQuote(newQuote);
      toast.success('Orçamento criado com sucesso!');
    }

    setIsFormOpen(false);
    setEditingQuote(null);
  };


  const columns = [
    { key: 'id' as const, header: 'Nº', render: (item: Quote) => item.id.slice(0, 8).toUpperCase() },
    { key: 'clientName' as const, header: 'Cliente' },
    {
      key: 'total' as const,
      header: 'Total',
      render: (item: Quote) =>
        `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'payments' as const,
      header: 'Pagamentos',
      render: (item: Quote) => {
        const paidAmount = (item.payments || []).reduce((acc, p) => acc + p.amount, 0);
        const remainingAmount = Math.max(0, item.total - paidAmount);
        return (
          <div className="text-sm">
            <div className="text-green-600">Pago: R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-orange-600">Faltam: R$ {remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        );
      },
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (item: Quote) => (
        <span className={cn(statusTextColors[item.status],'px-3 py-1 rounded text-xs font-medium', statusColors[item.status])}>
          {statusLabels[item.status]}
        </span>
      ),
    },
    {
      key: 'productionStatus' as const,
      header: 'Produção',
      render: (item: Quote) => (
        <span className="text-xs text-muted-foreground">
          {productionStatusLabels[item.productionStatus] || 'Aguardando'}
        </span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Criado em',
      render: (item: Quote) => format(new Date(item.createdAt), 'dd/MM/yyyy'),
    },
    {
      key: 'productionStatus' as const,
      header: 'Diferença',
      render: (item: Quote) => {
        const paidAmount = (item.payments || []).reduce((acc, p) => acc + p.amount, 0);
        const difference = paidAmount - item.total;
        if (difference > 0) {
          return (
            <div className="text-sm text-blue-600 font-medium">
              +R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          );
        }
        return <div className="text-sm text-muted-foreground">-</div>;
      },
    },
    {
      key: 'actions' as const,
      header: 'Ações',
      render: (item: Quote) => (
        <div className="flex gap-1">
          {(() => {
            const paidAmount = (item.payments || []).reduce((acc, p) => acc + p.amount, 0);
            const isFullyPaid = paidAmount >= item.total;
            if (isFullyPaid) {
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvert(item);
                  }}
                  title="Converter em Venda"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              );
            }
            return null;
          })()}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            title="Editar Orçamento"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSendWhatsApp(item);
            }}
            title="Enviar via WhatsApp"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/acompanhar/${item.id}`, '_blank');
            }}
            title="Ver página de acompanhamento"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPaymentDialog(item);
            }}
            title="Registrar pagamento"
          >
            <DollarSign className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStatusDialog(item);
            }}
            title="Atualizar status de produção"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSendWhatsApp = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    const phone = client?.phone?.replace(/\D/g, '') || '';
    const trackingUrl = `${BASE_URL}/acompanhar/${quote.id}`;
    
    const message = `Olá ${quote.clientName}! 🖨️

Seu orçamento *#${quote.id.slice(0, 8).toUpperCase()}* está pronto!

*Valor Total:* R$ ${quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

📋 *Itens:*
${quote.items.map(item => `• ${item.name} (${item.quantity}x) - R$ ${item.total.toFixed(2)}`).join('\n')}

🔗 *Acompanhe seu pedido:*
${trackingUrl}

Gráfica Express - Qualidade em impressão!`;

    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleOpenStatusDialog = (quote: Quote) => {
    setSelectedQuote(quote);
    setNewProductionStatus(quote.productionStatus || 'waiting_approval');
    setIsStatusOpen(true);
  };

  const handleUpdateProductionStatus = () => {
    if (!selectedQuote) return;
    updateQuote(selectedQuote.id, { productionStatus: newProductionStatus });
    toast.success('Status de produção atualizado!');
    setIsStatusOpen(false);
  };

  const handleConvert = (quote: Quote) => {
    if (confirm('Tem certeza que deseja converter este orçamento em venda?')) {
      convertQuoteToSale(quote.id, 'pix');
      toast.success('Orçamento convertido em venda!');
    }
  };

  const handleOpenPaymentDialog = (quote: Quote) => {
    setSelectedQuote(quote);
    setPaymentAmount('');
    setPaymentMethod('pix');
    setIsPaymentOpen(true);
  };

  const handleAddPayment = () => {
    if (!selectedQuote || !paymentAmount) {
      toast.error('Preencha o valor do pagamento');
      return;
    }

    // Converter formato brasileiro para número
    const amount = parseFloat(paymentAmount.replace(/\./g, '').replace(/,/g, '.'));
    
    if (amount <= 0) {
      toast.error('O valor do pagamento deve ser maior que zero');
      return;
    }

    const paidAmount = (selectedQuote.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const newTotalPaid = paidAmount + amount;

    const { addPaymentToQuote } = useStore.getState();
    addPaymentToQuote(selectedQuote.id, amount, paymentMethod);
    
    // Atualizar status baseado no total pago
    if (newTotalPaid >= selectedQuote.total) {
      updateQuote(selectedQuote.id, { status: 'fully_paid' });
    } else {
      updateQuote(selectedQuote.id, { status: 'partially_paid' });
    }
    
    toast.success('Pagamento registrado com sucesso!');
    
    setIsPaymentOpen(false);
  };

  const handleRemovePayment = (quoteId: string, paymentId: string) => {
    if (confirm('Tem certeza que deseja remover este pagamento?')) {
      const { removePaymentFromQuote } = useStore.getState();
      removePaymentFromQuote(quoteId, paymentId);
      toast.success('Pagamento removido com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Orçamentos"
        description="Gerencie seus orçamentos"
        action={{ label: 'Novo Orçamento', onClick: handleNew }}
      />

      {paidQuotes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Orçamentos Pagos e Parcialmente Pagos</h2>
          <DataTable
            data={paidQuotes}
            columns={columns}
            onDelete={handleDelete}
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Orçamentos Pendentes</h2>
      <DataTable
        data={unpaidQuotes}
        columns={columns}
        onDelete={handleDelete}
      />

      {/* New/Edit Quote Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuote ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
          </DialogHeader>
          <QuoteForm
            initialData={editingQuote}
            onSubmit={handleSaveQuote}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Update Production Status Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Status de Produção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Orçamento <strong>#{selectedQuote?.id.slice(0, 8).toUpperCase()}</strong> - {selectedQuote?.clientName}
            </p>
            <div>
              <Label>Status de Produção</Label>
              <Select value={newProductionStatus} onValueChange={(v) => setNewProductionStatus(v as ProductionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiting_approval">Aguardando Aprovação</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="in_production">Em Produção</SelectItem>
                  <SelectItem value="finishing">Acabamento</SelectItem>
                  <SelectItem value="ready">Pronto para Retirada</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProductionStatus}>
                Atualizar Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Orçamento de <strong>{selectedQuote?.clientName}</strong>
            </p>
            <p className="text-sm">
              Total do Orçamento: <strong>R$ {selectedQuote?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </p>
            {selectedQuote && (
              (() => {
                const paidAmount = (selectedQuote.payments || []).reduce((acc, p) => acc + p.amount, 0);
                const remaining = Math.max(0, (selectedQuote.total || 0) - paidAmount);
                return (
                  <>
                    <p className="text-sm">Já Pago: <strong>R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                    <p className="text-sm">Faltam: <strong>R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                  </>
                );
              })()
            )}
            <div>
              <Label htmlFor="payment-amount">Valor do Pagamento *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="payment-amount"
                  type="text"
                  placeholder="0,00"
                  value={paymentAmount}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .replace(/(\d)(\d{2})$/g, '$1,$2')
                      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    setPaymentAmount(value);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Forma de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit">Cartão de Débito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedQuote?.payments && selectedQuote.payments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Pagamentos Registrados</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedQuote.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <p className="font-medium">R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-600 capitalize">{payment.method}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePayment(selectedQuote.id, payment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPayment}>
                <DollarSign className="w-4 h-4 mr-2" />
                Registrar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
