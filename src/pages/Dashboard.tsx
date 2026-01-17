import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardChart } from '@/components/dashboard/DashboardChart';
import { MessageCircle, Calendar, ShoppingCart, DollarSign } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { getClients, getSales, getQuotes, loadClients, loadSales, loadQuotes, user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const clients = useStore((state) => state.clients);
  const sales = getSales();
  const quotes = getQuotes();

  // Carregar clientes, vendas e orçamentos ao montar o componente
    useEffect(() => {
      if (user?.id) {
        setIsLoading(true);
        Promise.all([loadClients(), loadSales(), loadQuotes()]).finally(() => {
          setIsLoading(false);
      });
      }
    }, [user?.id, loadClients, loadSales, loadQuotes]);

  const stats = (() => {
    const now = new Date();
    const thisMonth = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };

    const salesThisMonth = sales.filter((sale) =>
      isWithinInterval(new Date(sale.createdAt), thisMonth)
    );

    const totalSalesThisMonth = salesThisMonth.reduce((acc, sale) => acc + sale.total, 0);
    const pendingQuotes = quotes.filter((q) => q.status === 'pending').length;

    return {
      clients: clients.length,
      pendingQuotes,
      sales: salesThisMonth.length,
      totalSales: totalSalesThisMonth,
    };
  })();

  const clientsChartData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const count = clients.filter((c) =>
        isWithinInterval(new Date(c.createdAt), { start: monthStart, end: monthEnd })
      ).length;

      months.push({
        name: format(month, 'MMM/yy', { locale: ptBR }),
        value: count,
      });
    }
    return months;
  })();

  const salesChartData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const total = sales
        .filter((s) => isWithinInterval(new Date(s.createdAt), { start: monthStart, end: monthEnd }))
        .reduce((acc, s) => acc + s.total, 0);
      months.push({
        name: format(month, 'MMM/yy', { locale: ptBR }),
        value: total,
      });
    }
    return months;
  })();

  // Enquanto verifica autenticação, mostrar loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Alert Banner */}
      <div className="bg-amber-50 border-l-4 border-badge-warning text-amber-800 px-4 py-3 rounded mb-6 animate-fade-in">
        <p className="text-sm">
          <strong>Bem-vindo!</strong> Sistema de Gestão para Gráficas - Gerencie seus produtos, serviços, clientes e vendas.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Clientes"
          value={stats.clients}
          subtitle="cadastrados"
          badge="clientes"
          badgeVariant="success"
          icon={MessageCircle}
        />
        <StatCard
          title="Orçamentos"
          value={stats.pendingQuotes}
          subtitle="pendentes"
          badge="orçamentos"
          badgeVariant="warning"
          icon={Calendar}
        />
        <StatCard
          title="Vendas"
          value={stats.sales}
          subtitle="este mês"
          badge="vendas"
          badgeVariant="info"
          icon={ShoppingCart}
        />
        <StatCard
          title="Faturamento"
          value={`R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="no mês"
          badge="faturamento"
          badgeVariant="success"
          icon={DollarSign}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Novos Clientes"
          data={clientsChartData}
          color="hsl(var(--primary))"
        />
        <DashboardChart
          title="Vendas (R$)"
          data={salesChartData}
          color="hsl(var(--chart-2))"
        />
      </div>
    </div>
  );
}
