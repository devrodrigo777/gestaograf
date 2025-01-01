import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Sale, SaleItem } from '@/types';
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
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sales() {
  const { sales, clients, products, services, addSale, updateSale, deleteSale } = useStore();
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
    { key: 'id' as const, header: 'Nº', render: (item: Sale) => item.id.slice(0, 8).toUpperCase() },
    { key: 'clientName' as const, header: 'Cliente' },
    {
      key: 'paymentMethod' as const,
      header: 'Pagamento',
      render: (item: Sale) => paymentLabels[item.paymentMethod],
    },
    {
      key: 'total' as const,
      header: 'Total',
      render: (item: Sale) =>
        `R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (item: Sale) => (
        <span className={cn('text-white px-3 py-1 rounded text-xs font-medium', statusColors[item.status])}>
          {statusLabels[item.status]}
        </span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Data',
      render: (item: Sale) => format(new Date(item.createdAt), 'dd/MM/yyyy'),
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

  const handleDelete = (sale: Sale) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(sale.id);
      toast.success('Venda excluída com sucesso!');
    }
  };

  const total = formData.items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Vendas"
        description="Gerencie suas vendas"
        action={{ label: 'Nova Venda', onClick: handleOpen }}
      />

      <DataTable
        data={sales}
        columns={columns}
        onEdit={(sale) => sale.status === 'pending' && handleMarkAsPaid(sale)}
        onDelete={handleDelete}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Venda</DialogTitle>
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
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
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

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Venda</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
