import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { formatCurrencyForChart } from '@/lib/formatters';

interface DashboardChartProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
}

export function DashboardChart({ title, data, color = 'hsl(var(--primary))' }: DashboardChartProps) {
  
  const tooltipFormatter = (value: number) => {
    return [formatCurrencyForChart(value), 'Valor'];
  };

  const yAxisTickFormatter = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toLocaleString('pt-BR')}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden animate-fade-in">
      <div className="p-4 font-semibold flex items-center gap-2 border-b border-border">
        <BarChart2 className="w-5 h-5" />
        {title}
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisTickFormatter}
              width={80}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(label: string) => `Mês: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
