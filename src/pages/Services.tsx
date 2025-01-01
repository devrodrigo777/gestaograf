import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Service } from '@/types';
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
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Services() {
  const { services, addService, updateService, deleteService } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const columns = [
    { key: 'name' as const, header: 'Nome' },
    { key: 'description' as const, header: 'Descrição' },
    {
      key: 'price' as const,
      header: 'Preço',
      render: (item: Service) =>
        `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    { key: 'duration' as const, header: 'Duração' },
    {
      key: 'createdAt' as const,
      header: 'Cadastrado em',
      render: (item: Service) => format(new Date(item.createdAt), 'dd/MM/yyyy'),
    },
  ];

  const handleOpen = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        duration: service.duration || '',
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration: '' });
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const price = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(price)) {
      toast.error('Preço inválido');
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: formData.name,
        description: formData.description,
        price,
        duration: formData.duration,
      });
      toast.success('Serviço atualizado com sucesso!');
    } else {
      const newService: Service = {
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        price,
        duration: formData.duration,
        createdAt: new Date().toISOString(),
      };
      addService(newService);
      toast.success('Serviço cadastrado com sucesso!');
    }

    setIsOpen(false);
  };

  const handleDelete = (service: Service) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(service.id);
      toast.success('Serviço excluído com sucesso!');
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Serviços"
        description="Gerencie seus serviços"
        action={{ label: 'Novo Serviço', onClick: () => handleOpen() }}
      />

      <DataTable
        data={services}
        columns={columns}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do serviço"
              />
            </div>
            <div>
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ex: 2 dias, 1 semana"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do serviço"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingService ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
