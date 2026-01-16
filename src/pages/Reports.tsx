import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, parseISO, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, FileText, DollarSign, TrendingUp } from 'lucide-react';

export default function Reports() {
  const { sales: allSales, quotes: allQuotes, company } = useStore();
  const sales = allSales.filter(s => s.companyId === company?.id);
  const quotes = allQuotes.filter(q => q.companyId === company?.id);
  const [dateFilter, setDateFilter] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return isWithinInterval(saleDate, {
        start: parseISO(dateFilter.start),
        end: endOfDay(parseISO(dateFilter.end)),
      });
    });

  const filteredQuotes = quotes.filter((quote) => {
    const quoteDate = new Date(quote.createdAt);
    return isWithinInterval(quoteDate, {
      start: parseISO(dateFilter.start),
      end: endOfDay(parseISO(dateFilter.end)),
    });
  });

  const salesStats = (() => {
    const total = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
    const paid = filteredSales.filter((s) => s.status === 'paid');
    const paidTotal = paid.reduce((acc, sale) => acc + sale.total, 0);
    const pending = filteredSales.filter((s) => s.status === 'pending');
    const pendingTotal = pending.reduce((acc, sale) => acc + sale.total, 0);

    return {
      count: filteredSales.length,
      total,
      paidCount: paid.length,
      paidTotal,
      pendingCount: pending.length,
      pendingTotal,
    };
  })();

  const quotesPendingStats = (() => {
    const pendingQuotes = filteredQuotes.filter(q => q.status === 'pending');
    const pendingTotal = pendingQuotes.reduce((acc, q) => acc + q.total, 0);
    return {
      count: pendingQuotes.length,
      total: pendingTotal,
    };
  })();
  const quoteStats = (() => {
    const total = filteredQuotes.reduce((acc, quote) => acc + quote.total, 0);
    const pending = filteredQuotes.filter((q) => q.status === 'pending');
    const approved = filteredQuotes.filter((q) => q.status === 'approved');
    const converted = filteredQuotes.filter((q) => q.status === 'converted');
    const rejected = filteredQuotes.filter((q) => q.status === 'rejected');

    const conversionRate =
      filteredQuotes.length > 0
        ? ((converted.length / filteredQuotes.length) * 100).toFixed(1)
        : '0';

    return {
      count: filteredQuotes.length,
      total,
      pendingCount: pending.length,
      approvedCount: approved.length,
      convertedCount: converted.length,
      rejectedCount: rejected.length,
      conversionRate,
    };
  })();

  const monthlySalesData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const total = sales
        .filter((s) => isWithinInterval(new Date(s.createdAt), { start: monthStart, end: endOfDay(monthEnd) }))
        .reduce((acc, s) => acc + s.total, 0);

      months.push({
        name: format(month, 'MMM/yy', { locale: ptBR }),
        value: total,
      });
    }
    return months;
  })();

  const monthlyQuotesData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const total = quotes
        .filter((q) => isWithinInterval(new Date(q.createdAt), { start: monthStart, end: endOfDay(monthEnd) }))
        .reduce((acc, q) => acc + q.total, 0);

      months.push({
        name: format(month, 'MMM/yy', { locale: ptBR }),
        value: total,
      });
    }
    return months;
  })();

  return (
    <div className="p-6">
      <PageHeader title="Relatórios" description="Análise de vendas e orçamentos" />

      {/* Date Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="w-4 h-4" />
            Orçamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{salesStats.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  R$ {salesStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vendas Pagas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-badge-success">
                  {salesStats.paidCount}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (R$ {salesStats.paidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vendas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-badge-warning">
                  {salesStats.pendingCount}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (R$ {salesStats.pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <DashboardChart
            title="Vendas por Mês (R$)"
            data={monthlySalesData}
            color="hsl(var(--primary))"
          />

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Data</th>
                      <th className="text-left py-3 px-2">Cliente</th>
                      <th className="text-left py-3 px-2">Pagamento</th>
                      <th className="text-right py-3 px-2">Valor</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma venda encontrada no período
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            {format(new Date(sale.createdAt), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-2">{sale.clientName}</td>
                          <td className="py-3 px-2 capitalize">{sale.paymentMethod}</td>
                          <td className="py-3 px-2 text-right">
                            R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                sale.status === 'paid'
                                  ? 'bg-badge-success'
                                  : sale.status === 'pending'
                                  ? 'bg-badge-warning'
                                  : 'bg-badge-danger'
                              }`}
                            >
                              {sale.status === 'paid' ? 'Pago' : sale.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          {/* Quotes Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Orçamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{quoteStats.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-badge-warning">
                  {quotesPendingStats.count}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (R$ {quotesPendingStats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-badge-success">{quoteStats.approvedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Convertidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-badge-info">{quoteStats.convertedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{quoteStats.conversionRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Quotes Chart */}
          <DashboardChart
            title="Orçamentos por Mês (R$)"
            data={monthlyQuotesData}
            color="hsl(var(--chart-2))"
          />

          {/* Quotes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Data</th>
                      <th className="text-left py-3 px-2">Cliente</th>
                      <th className="text-right py-3 px-2">Valor</th>
                      <th className="text-left py-3 px-2">Válido até</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum orçamento encontrado no período
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            {format(new Date(quote.createdAt), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-2">{quote.clientName}</td>
                          <td className="py-3 px-2 text-right">
                            R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2">
                            {format(new Date(quote.validUntil), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                quote.status === 'approved'
                                  ? 'bg-badge-success'
                                  : quote.status === 'pending'
                                  ? 'bg-badge-warning'
                                  : quote.status === 'converted'
                                  ? 'bg-badge-info'
                                  : 'bg-badge-danger'
                              }`}
                            >
                              {quote.status === 'approved'
                                ? 'Aprovado'
                                : quote.status === 'pending'
                                ? 'Pendente'
                                : quote.status === 'converted'
                                ? 'Convertido'
                                : 'Rejeitado'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
