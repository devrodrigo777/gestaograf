import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Quote, QuoteItem, ProductionStatus } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, ArrowRightLeft, Send, Eye, Settings } from 'lucide-react';
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
  const { quotes, clients, products, services, addQuote, updateQuote, deleteQuote, convertQuoteToSale } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [newProductionStatus, setNewProductionStatus] = useState<ProductionStatus>('waiting_approval');
  const [formData, setFormData] = useState({
    clientId: '',
    validDays: '30',
    notes: '',
    items: [] as QuoteItem[],
  });
  const [newItem, setNewItem] = useState({
    type: 'product',
    itemId: '',
    quantity: '1',
  });

  const statusLabels = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    converted: 'Convertido',
  };

  const statusColors = {
    pending: 'bg-badge-warning',
    approved: 'bg-badge-success',
    rejected: 'bg-badge-danger',
    converted: 'bg-badge-info',
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
      key: 'status' as const,
      header: 'Status',
      render: (item: Quote) => (
        <span className={cn('text-white px-3 py-1 rounded text-xs font-medium', statusColors[item.status])}>
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
      key: 'actions' as const,
      header: 'Ações',
      render: (item: Quote) => (
        <div className="flex gap-1">
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

  const handleOpen = () => {
    setFormData({ clientId: '', validDays: '30', notes: '', items: [] });
    setNewItem({ type: 'product', itemId: '', quantity: '1' });
    setIsOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.itemId || !newItem.quantity) {
      toast.error('Selecione um item e quantidade');
      return;
    }

    const quantity = parseInt(newItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    let name = '';
    let unitPrice = 0;

    if (newItem.type === 'product') {
      const product = products.find((p) => p.id === newItem.itemId);
      if (!product) return;
      name = product.name;
      unitPrice = product.price;
    } else {
      const service = services.find((s) => s.id === newItem.itemId);
      if (!service) return;
      name = service.name;
      unitPrice = service.price;
    }

    const item: QuoteItem = {
      id: crypto.randomUUID(),
      productId: newItem.type === 'product' ? newItem.itemId : undefined,
      serviceId: newItem.type === 'service' ? newItem.itemId : undefined,
      name,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };

    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ type: 'product', itemId: '', quantity: '1' });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.id !== itemId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    const client = clients.find((c) => c.id === formData.clientId);
    if (!client) return;

    const total = formData.items.reduce((acc, item) => acc + item.total, 0);
    const validDays = parseInt(formData.validDays) || 30;

    const newQuote: Quote = {
      id: crypto.randomUUID(),
      clientId: formData.clientId,
      clientName: client.name,
      clientPhone: client.phone,
      items: formData.items,
      total,
      status: 'pending',
      productionStatus: 'waiting_approval',
      validUntil: addDays(new Date(), validDays).toISOString(),
      createdAt: new Date().toISOString(),
      notes: formData.notes,
    };

    addQuote(newQuote);
    toast.success('Orçamento criado com sucesso!');
    setIsOpen(false);
  };

  const handleConvert = (quote: Quote) => {
    setSelectedQuote(quote);
    setPaymentMethod('pix');
    setIsConvertOpen(true);
  };

  const handleConfirmConvert = () => {
    if (!selectedQuote) return;
    convertQuoteToSale(selectedQuote.id, paymentMethod as any);
    toast.success('Orçamento convertido em venda!');
    setIsConvertOpen(false);
  };

  const handleDelete = (quote: Quote) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteQuote(quote.id);
      toast.success('Orçamento excluído com sucesso!');
    }
  };

  const total = formData.items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Orçamentos"
        description="Gerencie seus orçamentos"
        action={{ label: 'Novo Orçamento', onClick: handleOpen }}
      />

      <DataTable
        data={quotes}
        columns={columns}
        onEdit={(quote) => quote.status === 'pending' && handleConvert(quote)}
        onDelete={handleDelete}
      />

      {/* New Quote Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade (dias)</Label>
                <Input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
                />
              </div>
            </div>

            {/* Add Item */}
            <div className="border border-border rounded-lg p-4">
              <Label className="mb-3 block">Adicionar Item</Label>
              <div className="grid grid-cols-4 gap-2">
                <Select
                  value={newItem.type}
                  onValueChange={(value) => setNewItem({ ...newItem, type: value, itemId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Produto</SelectItem>
                    <SelectItem value="service">Serviço</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newItem.itemId}
                  onValueChange={(value) => setNewItem({ ...newItem, itemId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {newItem.type === 'product'
                      ? products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - R$ {p.price.toFixed(2)}
                          </SelectItem>
                        ))
                      : services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} - R$ {s.price.toFixed(2)}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="Qtd"
                />
                <Button type="button" onClick={handleAddItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Item</th>
                      <th className="text-right p-3">Qtd</th>
                      <th className="text-right p-3">Unit.</th>
                      <th className="text-right p-3">Total</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-3">{item.name}</td>
                        <td className="text-right p-3">{item.quantity}</td>
                        <td className="text-right p-3">R$ {item.unitPrice.toFixed(2)}</td>
                        <td className="text-right p-3">R$ {item.total.toFixed(2)}</td>
                        <td className="p-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-muted font-semibold">
                      <td colSpan={3} className="p-3 text-right">
                        Total:
                      </td>
                      <td className="text-right p-3">
                        R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações do orçamento..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Orçamento</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Convert to Sale Dialog */}
      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Converter em Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Converter orçamento de <strong>{selectedQuote?.clientName}</strong> no valor de{' '}
              <strong>
                R$ {selectedQuote?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
            </p>
            <div>
              <Label>Forma de Pagamento</Label>
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
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsConvertOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmConvert}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Converter
              </Button>
            </div>
          </div>
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
    </div>
  );
}
