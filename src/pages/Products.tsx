import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Product, MeasurementUnit } from '@/types';
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
import { format } from 'date-fns';
// Removed Image and Upload imports as they were only used for image field
import { formatCurrency, parseCurrency } from '@/lib/formatters';

const measurementUnitLabels: Record<MeasurementUnit, string> = {
  unit: 'Unidade',
  m2: 'm²',
  linear_meter: 'Metro Linear',
};

export default function Products() {
  const { addProduct, updateProduct, deleteProduct, user, loadProducts } = useStore();
  // Use products diretamente do store para garantir re-renderização
  const products = useStore((state) => state.products);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    measurementUnit: 'unit' as MeasurementUnit,
  });

  // Carregar produtos ao montar o componente
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      loadProducts().finally(() => setIsLoading(false));
    }
  }, [user?.id, loadProducts]);

  const columns = [
    { key: 'name' as const, header: 'Nome' },
    { key: 'category' as const, header: 'Categoria' },
    {
      key: 'price' as const,
      header: 'Preço',
      render: (item: Product) =>
        item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      key: 'measurementUnit' as const,
      header: 'Unidade',
      render: (item: Product) => measurementUnitLabels[item.measurementUnit],
    },
    {
      key: 'createdAt' as const,
      header: 'Cadastrado em',
      render: (item: Product) => format(new Date(item.createdAt), 'dd/MM/yyyy'),
    },
  ];

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: formatCurrency(product.price * 100), // Converter para formato de moeda
        category: product.category,
        measurementUnit: product.measurementUnit,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        measurementUnit: 'unit',
      });
    }
    setIsOpen(true);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, price: formatCurrency(rawValue) });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const price = parseCurrency(formData.price);
    if (isNaN(price)) {
      toast.error('Preço inválido');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price,
      category: formData.category,
      measurementUnit: formData.measurementUnit,
    };

    setIsLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // O companyId será preenchido pelo serviço baseado no usuário autenticado
        const newProduct: Product = {
          id: crypto.randomUUID(),
          companyId: '', // Será preenchido pelo serviço
          ...productData,
          createdAt: new Date().toISOString(),
        };
        await addProduct(newProduct);
        toast.success('Produto cadastrado com sucesso!');
      }

      setIsOpen(false);
      // Recarregar produtos após adicionar/editar
      await loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setIsLoading(true);
      try {
        await deleteProduct(product.id);
        toast.success('Produto excluído com sucesso!');
        // Recarregar produtos após deletar
        await loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Produtos"
        description="Gerencie seus produtos"
        action={{ label: 'Novo Produto', onClick: () => handleOpen() }}
      />

      <DataTable
        data={products}
        columns={columns}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Impressão"
                />
              </div>
              <div>
                <Label htmlFor="measurementUnit">Unidade de Medida *</Label>
                <Select
                  value={formData.measurementUnit}
                  onValueChange={(value) => setFormData({ ...formData, measurementUnit: value as MeasurementUnit })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Unidade</SelectItem>
                    <SelectItem value="m2">m²</SelectItem>
                    <SelectItem value="linear_meter">Metro Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={handlePriceChange}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {editingProduct ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
