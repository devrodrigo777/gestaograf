import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Sale, SaleItem, ProductionStatus } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, CheckCircle, Eye, Send, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPaymentsBySaleQuoteId } from '@/services/saleService';

const BASE_URL = window.location.origin;

const productionStatusLabels: Record<ProductionStatus, string> = {
  waiting_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  in_production: 'Em Produção',
  finishing: 'Acabamento',
  ready: 'Pronto',
  delivered: 'Entregue',
};

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  boleto: 'Boleto',
};

export default function Sales() {
  const {
    deleteSale,
    updateSale,
    loadSales,
    company,
  } = useStore();

  // Carregar vendas ao iniciar o componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadSales();
      } catch (error) {
        console.error('Erro ao carregar vendas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [loadSales]);

  // ✅ Seletores reativos
  const allSales = useStore((state) => state.sales);

  const sales = allSales.filter(s => s.companyId === company?.id);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newProductionStatus, setNewProductionStatus] = useState<ProductionStatus>('approved');
  const [isLoading, setIsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    paymentMethod: 'pix',
    items: [] as SaleItem[],
  });
  const [newItem, setNewItem] = useState({
    type: 'product',
    itemId: '',
    quantity: '1',
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [productionStatus, setProductionStatus] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsSaleOpen, setDetailsSaleOpen] = useState(false);
  const [detailsSale, setDetailsSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const statusLabels = {
    pending: 'Pendente',
    paid: 'Pago',
    cancelled: 'Cancelado',
  };

  const statusColors = {
    pending: 'bg-badge-warning',
    paid: 'bg-badge-success',
    cancelled: 'bg-badge-danger',
  };

  const paymentLabels = {
    cash: 'Dinheiro',
    credit: 'Crédito',
    debit: 'Débito',
    pix: 'PIX',
    boleto: 'Boleto',
  };

  const columns = [
    { 
      key: 'id' as const, 
      header: 'Nº', 
      render: (item: Sale) => item.id.slice(0, 8).toUpperCase() 
    },
    { 
      key: 'clientName' as const, 
      header: 'Cliente' 
    },
    {
      key: 'total' as const,
      header: 'Total',
      render: (item: Sale) =>
        `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'paymentMethod' as const,
      header: 'Pagamento',
      render: (item: Sale) => (
        <span className="text-sm">
          {paymentMethodLabels[item.paymentMethod] || item.paymentMethod}
        </span>
      ),
    },
    {
      key: 'productionStatus' as const,
      header: 'Status Produção',
      render: (item: Sale) => {
        const statusColors: Record<ProductionStatus, string> = {
          waiting_approval: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-blue-100 text-blue-800',
          in_production: 'bg-purple-100 text-purple-800',
          finishing: 'bg-orange-100 text-orange-800',
          ready: 'bg-green-100 text-green-800',
          delivered: 'bg-gray-100 text-gray-800',
        };

        return (
          <span className={cn('px-3 py-1 rounded text-xs font-medium', statusColors[item.productionStatus])}>
            {productionStatusLabels[item.productionStatus] || 'Aprovado'}
          </span>
        );
      },
    },
    {
      key: 'createdAt' as const,
      header: 'Data',
      render: (item: Sale) => {
        if (!item.createdAt) return '-';
        try {
          return format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm');
        } catch {
          return '-';
        }
      },
    },
    {
      key: 'deliveryDate' as const,
      header: 'Entrega',
      render: (item: Sale) => {
        if (!item.deliveryDate) return '-';
        try {
          return format(new Date(item.deliveryDate), 'dd/MM/yyyy');
        } catch {
          return '-';
        }
      },
    },
    {
      key: 'actions' as const,
      header: 'Ações',
      render: (item: Sale) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailsDialog(item);
            }}
            title="Ver detalhes da venda"
          >
            <FileText className="w-4 h-4" />
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

  const handleOpen = () => {
    setFormData({ clientId: '', paymentMethod: 'pix', items: [] });
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

    const item: SaleItem = {
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

    const newSale: Sale = {
      id: crypto.randomUUID(),
      companyId: company!.id,
      clientId: formData.clientId,
      clientName: client.name,
      items: formData.items,
      total,
      paymentMethod: formData.paymentMethod as Sale['paymentMethod'],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addSale(newSale);
    toast.success('Venda registrada com sucesso!');
    setIsOpen(false);
  };

  const handleMarkAsPaid = (sale: Sale) => {
    updateSale(sale.id, { status: 'paid' });
    toast.success('Venda marcada como paga!');
  };

  const handleDelete = async (sale: Sale) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      setIsLoading(true);
      try {
        await deleteSale(sale.id);
        toast.success('Venda excluída com sucesso!');
        await loadSales();
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        toast.error('Erro ao excluir venda');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendWhatsApp = (sale: Sale) => {
    const client = clients.find(c => c.id === sale.clientId);
    const phone = client?.phone?.replace(/\D/g, '') || '';
    const trackingUrl = `${BASE_URL}/acompanhar/${sale.quoteId || sale.id}`;
    
    const message = `Olá ${sale.clientName}! 🖨️

Sua venda *#${sale.id.slice(0, 8).toUpperCase()}* foi registrada!

*Valor Total:* R$ ${sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

📋 *Itens:*
${sale.items.map(item => `• ${item.name} (${item.quantity}x) - R$ ${item.total.toFixed(2)}`).join('\n')}

🔗 *Acompanhe seu pedido:*
${trackingUrl}

Gráfica Express - Qualidade em impressão!`;

    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleOpenStatusDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setNewProductionStatus(sale.productionStatus || 'approved');
    setIsStatusOpen(true);
  };

  const handleOpenDetailsDialog = async (sale: Sale) => {
    setDetailsSale(sale);
    setDetailsSaleOpen(true);
    setPaymentLoading(true);
    try {
      if (sale.quoteId) {
        const paymentsData = await getPaymentsBySaleQuoteId(sale.quoteId);
        setPayments(paymentsData);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast.error('Erro ao buscar pagamentos');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdateProductionStatus = async () => {
    if (!selectedSale) return;

    setIsLoading(true);
    try {
      await updateSale(selectedSale.id, { productionStatus: newProductionStatus });
      toast.success('Status de produção atualizado!');
      setIsStatusOpen(false);
      await loadSales();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProductionStatus = () => {
    if (!selectedSale) return;
    
    updateSale(selectedSale.id, { productionStatus: productionStatus as ProductionStatus });
    toast.success('Status de produção atualizado!');
    setStatusDialogOpen(false);
  };

  const total = formData.items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Vendas"
        description="Gerencie suas vendas realizadas"
      />

      <div className="mb-4 p-4 bg-card rounded-lg border">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold">{sales.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Faturamento Total</p>
            <p className="text-2xl font-bold">
              R$ {sales.reduce((acc, s) => acc + s.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">
              R$ {sales.length > 0 
                ? (sales.reduce((acc, s) => acc + s.total, 0) / sales.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                : '0,00'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={sales}
        columns={columns}
        onDelete={handleDelete}
      />

      {/* Update Production Status Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Status de Produção</DialogTitle>
            <DialogDescription>
              Selecione o novo status de produção para a venda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Venda <strong>#{selectedSale?.id.slice(0, 8).toUpperCase()}</strong> - {selectedSale?.clientName}
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

      {/* Sale Details Dialog */}
      <Dialog open={detailsSaleOpen} onOpenChange={setDetailsSaleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              Venda #{detailsSale?.id.slice(0, 8).toUpperCase()} - {detailsSale?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-semibold">{detailsSale?.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">
                  R$ {detailsSale?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                <p className="font-semibold">
                  {paymentMethodLabels[detailsSale?.paymentMethod || 'pix']}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-semibold">
                  {detailsSale && format(new Date(detailsSale.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Itens da Venda */}
            <div>
              <p className="text-sm font-semibold mb-3">Itens</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {detailsSale?.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagamentos */}
            <div>
              <p className="text-sm font-semibold mb-3">Pagamentos</p>
              {paymentLoading ? (
                <p className="text-sm text-muted-foreground">Carregando pagamentos...</p>
              ) : payments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between text-sm p-2 bg-green-50 border border-green-200 rounded">
                      <div>
                        <p className="font-medium">{payment.metodo || payment.method || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.criado_em && format(new Date(payment.criado_em), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <p className="font-semibold text-green-700">
                        R$ {parseFloat(payment.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum pagamento registrado</p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDetailsSaleOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
