import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/ui/page-header';
import { Quote, Sale, ProductionStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
const BASE_URL = 'https://graficaexpress.com.br';
import { format } from 'date-fns';

const productionStatusLabels: Record<ProductionStatus, string> = {
  waiting_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  in_production: 'Em Produção',
  finishing: 'Acabamento',
  ready: 'Pronto',
  delivered: 'Entregue',
};

export default function Activities() {
  const { quotes, sales, company, updateQuote, updateSale, dismissActivity, dismissedActivityIds } = useStore();

  const handleStatusChange = (activity: Quote | Sale, newStatus: ProductionStatus) => {
    const sendWhatsAppForStatus = (status: ProductionStatus) => status === 'ready' || status === 'delivered';

    if ('payments' in activity) { // It's a Quote
      updateQuote(activity.id, { productionStatus: newStatus });
      if (sendWhatsAppForStatus(newStatus)) {
        if (confirm('Deseja informar o cliente e enviar o link de acompanhar via WhatsApp?')) {
          const phone = activity.clientPhone?.replace(/\D/g, '') || '';
          const trackingUrl = `${BASE_URL}/acompanhar/${activity.id}`;
          const message = `Olá ${activity.clientName}!\n\nO status do seu pedido #${activity.id.slice(0,8).toUpperCase()} foi atualizado para: ${newStatus === 'ready' ? 'Pronto para Retirada' : 'Entregue'}\n\nAcompanhe: ${trackingUrl}`;
          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    } else { // It's a Sale
      updateSale(activity.id, { productionStatus: newStatus });
      if (sendWhatsAppForStatus(newStatus)) {
        if (confirm('Deseja informar o cliente e enviar o link de acompanhar via WhatsApp?')) {
          const phone = activity.clientPhone?.replace(/\D/g, '') || '';
          const trackingUrl = `${BASE_URL}/acompanhar/${activity.id}`;
          const message = `Olá ${activity.clientName}!\n\nO status do seu pedido #${activity.id.slice(0,8).toUpperCase()} foi atualizado para: ${newStatus === 'ready' ? 'Pronto para Retirada' : 'Entregue'}\n\nAcompanhe: ${trackingUrl}`;
          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    }
  };

  // Show all activities with a productionStatus (do not auto-remove them)
  const productionQuotes = quotes.filter((q) => q.companyId === company?.id && q.productionStatus && q.productionStatus !== 'waiting_approval' && q.status !== 'converted');
  const productionSales = sales.filter((s) => s.companyId === company?.id && s.productionStatus);

  let allActivities: (Quote | Sale)[] = [...productionQuotes, ...productionSales];
  // Filter out dismissed activities for this user/session
  allActivities = allActivities.filter(a => !dismissedActivityIds.includes(a.id));

  return (
    <div className="p-6">
      <PageHeader
        title="Atividades"
        description="Acompanhe as tarefas de produção"
      />

      {allActivities.length === 0 ? (
        <p className="italic text-muted-foreground">
          Você ainda não possui nenhuma atividade à fazer.
        </p>
      ) : (
        <div className="grid gap-4">
          {allActivities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{activity.clientName}</span>
                    <span className="text-xs text-muted-foreground">{ 'payments' in activity ? 'Orçamento' : 'Venda' }</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{activity.id.slice(0, 8).toUpperCase()}</span>
                    <Button variant="ghost" size="sm" onClick={() => dismissActivity(activity.id)} title="Remover das Atividades">
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {activity.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-sm">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t">
                  {(() => {
                    let paidAmount = 0;
                    let remaining = 0;
                    if ('payments' in activity) {
                      paidAmount = (activity.payments || []).reduce((acc, p) => acc + p.amount, 0);
                      remaining = Math.max(0, activity.total - paidAmount);
                    } else {
                      const linkedQuote = quotes.find(q => q.id === (activity as Sale).quoteId);
                      if (linkedQuote) {
                        paidAmount = (linkedQuote.payments || []).reduce((acc, p) => acc + p.amount, 0);
                        remaining = Math.max(0, linkedQuote.total - paidAmount);
                      }
                    }

                    return (
                      <div className="flex items-center gap-3 mb-3">
                        {activity.deliveryDate && (
                          <Badge variant="outline">Entrega: {format(new Date(activity.deliveryDate), 'dd/MM/yyyy')}</Badge>
                        )}
                        <Badge variant="outline">Pago: R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Badge>
                        <Badge variant="outline">Faltam: R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Badge>
                      </div>
                    );
                  })()}
                  <div>
                    <Label>Status de Produção</Label>
                    <Select
                      value={activity.productionStatus}
                      onValueChange={(newStatus) => handleStatusChange(activity, newStatus as ProductionStatus)}
                    >
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
                  {activity.deliveryDate && (
                    <p>
                      Data de Entrega: <span className="font-semibold">{format(new Date(activity.deliveryDate), 'dd/MM/yyyy')}</span>
                    </p>
                  )}
                  {'payments' in activity && activity.payments && activity.payments.length > 0 && (
                    <div>
                        <p>Pagamentos:</p>
                        <ul className="text-sm">
                            {activity.payments.map(p => (
                                <li key={p.id}>
                                    - {p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({p.method})
                                </li>
                            ))}
                        </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
