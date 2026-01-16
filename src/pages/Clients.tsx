import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Client } from '@/types';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { InputMask } from '@react-input/mask';

export default function Clients() {
  const { getClients, addClient, updateClient, deleteClient, company } = useStore();
  const clients = getClients();
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cpfCnpj: '',
  });

  const columns = [
    { key: 'name' as const, header: 'Nome' },
    { key: 'email' as const, header: 'E-mail' },
    { key: 'phone' as const, header: 'Telefone' },
    { key: 'cpfCnpj' as const, header: 'CPF/CNPJ' },
    {
      key: 'createdAt' as const,
      header: 'Cadastrado em',
      render: (item: Client) => format(new Date(item.createdAt), 'dd/MM/yyyy'),
    },
  ];

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address || '',
        cpfCnpj: client.cpfCnpj || '',
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', address: '', cpfCnpj: '' });
    }
    setIsOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    // The mask library handles unmasking, but let's be safe
    const unmaskedData = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
      cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
    }

    if (editingClient) {
      updateClient(editingClient.id, unmaskedData);
      toast.success('Cliente atualizado com sucesso!');
    } else {
      const newClient: Client = {
        id: crypto.randomUUID(),
        companyId: company!.id,
        ...unmaskedData,
        createdAt: new Date().toISOString(),
      };
      addClient(newClient);
      toast.success('Cliente cadastrado com sucesso!');
    }

    setIsOpen(false);
  };

  const handleDelete = (client: Client) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(client.id);
      toast.success('Cliente excluído com sucesso!');
    }
  };

    const cpfCnpjMask =
    formData.cpfCnpj.replace(/\D/g, '').length < 11
      ? '___.___.___-__'
      : '__.___.___/____-__';

  return (
    <div className="p-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes"
        action={{ label: 'Novo Cliente', onClick: () => handleOpen() }}
      />

      <DataTable
        data={clients}
        columns={columns}
        onEdit={handleOpen}
        onDelete={handleDelete}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <InputMask
                id="phone"
                component={Input}
                mask="(__) _____-____"
                replacement={{ _: /\d/ }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(__) _____-____"
              />
            </div>
            <div>
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <InputMask
                id="cpfCnpj"
                component={Input}
                mask={cpfCnpjMask}
                replacement={{ _: /\d/ }}
                value={formData.cpfCnpj}
                onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                placeholder={cpfCnpjMask}
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingClient ? 'Salvar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
