import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function Settings() {
  const { user, updateUser } = useStore();
  const [empresaNome, setEmpresaNome] = useState(user?.empresa || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !empresaNome.trim()) {
      toast.error('Nome da empresa não pode estar vazio');
      return;
    }

    console.log("Tentando atualizar o ID:", user?.companyId);
    setLoading(true);
    try {
      
      const { data: userData, error: userError } = await supabase
      .from('usuarios_autorizados')
      .update({ empresa: empresaNome })
      .eq('id', user.companyId) // Verifique se o ID está correto aqui
      .select() 
      .single();

    if (userError) {
      throw userError; // Lança o erro para ser pego no catch
    }

    if (!userData) {
      toast.error('Registro não encontrado no banco');
      return;
    }

    await updateUser({ ...user, empresa: userData.empresa });
    toast.success('Nome da empresa atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Configurações"
        description="Gerencie suas configurações de conta"
      />
      <div className="max-w-md space-y-6">
        <div>
          <Label htmlFor="empresaNome">Nome da Empresa</Label>
          <Input
            id="empresaNome"
            value={empresaNome}
            onChange={(e) => setEmpresaNome(e.target.value)}
            placeholder="Digite o nome da sua empresa"
          />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}