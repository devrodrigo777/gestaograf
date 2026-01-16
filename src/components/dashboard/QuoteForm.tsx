import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Quote, QuoteItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

interface QuoteFormProps {
  initialData?: Quote | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function QuoteForm({ initialData, onSubmit, onCancel }: QuoteFormProps) {
  const { clients, products, services } = useStore();
  const [formData, setFormData] = useState({
    clientId: '',
    validDays: '30',
    notes: '',
    deliveryDate: '',
    items: [] as QuoteItem[],
  });
  const [newItem, setNewItem] = useState({
    type: 'product',
    itemId: '',
    quantity: '1',
    width: '',
    height: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientId: initialData.clientId,
        validDays: Math.round((new Date(initialData.validUntil).getTime() - new Date(initialData.createdAt).getTime()) / (1000 * 3600 * 24)).toString(),
        notes: initialData.notes || '',
        deliveryDate: initialData.deliveryDate ? format(new Date(initialData.deliveryDate), 'yyyy-MM-dd') : '',
        items: initialData.items,
      });
    }
  }, [initialData]);

  const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
  const productOptions = products.map(p => ({ value: p.id, label: `${p.name} - R$ ${p.price.toFixed(2)}` }));
  const serviceOptions = services.map(s => ({ value: s.id, label: `${s.name} - R$ ${s.price.toFixed(2)}` }));

  const selectedProduct = useMemo(() => {
    if (newItem.type === 'product' && newItem.itemId) {
      return products.find(p => p.id === newItem.itemId);
    }
    return null;
  }, [newItem.itemId, newItem.type, products]);

  const handleAddItem = () => {
    if (!newItem.itemId) {
      toast.error('Selecione um item');
      return;
    }

    let name = '';
    let unitPrice = 0;
    let quantity = 0;
    let width: number | undefined = undefined;
    let height: number | undefined = undefined;

    if (newItem.type === 'product') {
      if (!selectedProduct) return;
      name = selectedProduct.name;
      unitPrice = selectedProduct.price;

      if (selectedProduct.measurementUnit === 'm2') {
        width = parseFloat(newItem.width.replace(',', '.'));
        height = parseFloat(newItem.height.replace(',', '.'));
        if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
          toast.error('Largura e Altura inválidas');
          return;
        }
        quantity = width * height;
      } else {
        quantity = parseInt(newItem.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          toast.error('Quantidade inválida');
          return;
        }
      }
    } else { // Service
      const service = services.find((s) => s.id === newItem.itemId);
      if (!service) return;
      name = service.name;
      unitPrice = service.price;
      quantity = parseInt(newItem.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Quantidade inválida');
        return;
      }
    }

    const item: QuoteItem = {
      id: crypto.randomUUID(),
      productId: newItem.type === 'product' ? newItem.itemId : undefined,
      serviceId: newItem.type === 'service' ? newItem.itemId : undefined,
      name,
      quantity,
      width,
      height,
      unitPrice,
      total: quantity * unitPrice,
    };

    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ type: 'product', itemId: '', quantity: '1', width: '', height: '' });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.id !== itemId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const renderQuantityInput = () => {
    if (newItem.type === 'service' || !selectedProduct) {
      return (
        <Input
          type="number"
          min="1"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          placeholder="Qtd"
        />
      );
    }
  
    switch (selectedProduct.measurementUnit) {
      case 'm2':
        return (
          <div className="flex gap-2">
            <Input
              type="text"
              value={newItem.width}
              onChange={(e) => setNewItem({ ...newItem, width: e.target.value })}
              placeholder="Largura (m)"
            />
            <Input
              type="text"
              value={newItem.height}
              onChange={(e) => setNewItem({ ...newItem, height: e.target.value })}
              placeholder="Altura (m)"
            />
          </div>
        );
      case 'linear_meter':
        return (
          <Input
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            placeholder="Metros"
          />
        );
      case 'unit':
      default:
        return (
          <Input
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            placeholder="Qtd"
          />
        );
    }
  };

  const total = formData.items.reduce((acc, item) => acc + item.total, 0);
  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cliente *</Label>
          <Combobox
            options={clientOptions}
            value={formData.clientId}
            onChange={(value) => setFormData({ ...formData, clientId: value })}
            placeholder="Selecione um cliente"
            searchPlaceholder="Buscar cliente..."
            emptyText="Nenhum cliente encontrado."
          />
        </div>
        <div>
          <Label>Validade (dias)</Label>
          <Input
            type="number"
            value={formData.validDays}
            onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
          />
        </div>
        <div>
          <Label>Data de Entrega</Label>
          <Input
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
          />
        </div>
      </div>

      {/* Add Item */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <Label>Adicionar Item</Label>
        <div className="grid grid-cols-[1fr,2fr] gap-2 items-center">
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
          
          <Combobox
            options={newItem.type === 'product' ? productOptions : serviceOptions}
            value={newItem.itemId}
            onChange={(value) => setNewItem({ ...newItem, itemId: value })}
            placeholder="Selecione um item"
            searchPlaceholder="Buscar item..."
            emptyText="Nenhum item encontrado."
          />
        </div>
        <div className="grid grid-cols-[2fr,auto] gap-2 items-center">
          {renderQuantityInput()}
          <Button type="button" onClick={handleAddItem} className="self-end">
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
                  <td className="p-3">
                    {item.name}
                    {item.width && item.height && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.width}m x {item.height}m)
                      </span>
                    )}
                  </td>
                  <td className="text-right p-3">{item.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td>
                  <td className="text-right p-3">{item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="text-right p-3">{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}</Button>
      </div>
    </form>
  );
}
