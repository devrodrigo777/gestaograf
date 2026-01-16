import { useState, useEffect, useRef, useMemo } from 'react';
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
import { Image, Upload } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/lib/formatters';

const measurementUnitLabels: Record<MeasurementUnit, string> = {
  unit: 'Unidade',
  m2: 'm²',
  linear_meter: 'Metro Linear',
};

export default function Products() {
  const { products: allProducts, addProduct, updateProduct, deleteProduct, company } = useStore();
  const products = useMemo(() => {
    if (!company) return [];
    return allProducts.filter((p) => p.companyId === company.id);
  }, [allProducts, company]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    measurementUnit: 'unit' as MeasurementUnit,
    image: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const columns = [
    {
      key: 'image' as const,
      header: 'Imagem',
      render: (item: Product) => (
        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <Image className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      ),
    },
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
        price: formatCurrency(product.price),
        category: product.category,
        measurementUnit: product.measurementUnit,
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        measurementUnit: 'unit',
        image: '',
      });
    }
    setIsOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, price: formatCurrency(rawValue) });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
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
      image: formData.image,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Produto atualizado com sucesso!');
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        companyId: company!.id,
        ...productData,
        createdAt: new Date().toISOString(),
      };
      addProduct(newProduct);
      toast.success('Produto cadastrado com sucesso!');
    }

    setIsOpen(false);
  };

  const handleDelete = (product: Product) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(product.id);
      toast.success('Produto excluído com sucesso!');
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
            <div>
              <Label>Imagem</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
