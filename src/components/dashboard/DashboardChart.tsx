import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

interface DashboardChartProps {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
}

export function DashboardChart({ title, data, color = 'hsl(var(--primary))' }: DashboardChartProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden animate-fade-in">
      <div className="chart-header">
        <BarChart2 className="w-5 h-5" />
        {title}
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
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
