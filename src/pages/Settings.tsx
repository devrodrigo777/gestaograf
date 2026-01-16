import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser } = useStore();
  const [displayName, setDisplayName] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    const updatedUser: Partial<User> = {
      username: displayName,
    };

    if (password) {
      updatedUser.password = password;
    }

    updateUser(updatedUser);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Configurações"
        description="Gerencie suas configurações de conta"
      />
      <div className="max-w-md space-y-6">
        <div>
          <Label htmlFor="displayName">Nome de Exibição</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Nova Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
