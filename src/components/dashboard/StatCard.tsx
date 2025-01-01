import { cn } from '@/lib/utils';
import { LucideIcon, MessageCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge: string;
  badgeVariant: 'success' | 'warning' | 'info' | 'danger';
  icon?: LucideIcon;
}

export function StatCard({ title, value, subtitle, badge, badgeVariant, icon: Icon }: StatCardProps) {
  const badgeClasses = {
    success: 'bg-badge-success',
    warning: 'bg-badge-warning',
    info: 'bg-badge-info',
    danger: 'bg-badge-danger',
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-foreground font-medium">{title}</h3>
        <span className={cn('text-white px-3 py-1 rounded text-xs font-medium', badgeClasses[badgeVariant])}>
          {badge}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-light text-foreground">{value}</p>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        {Icon && (
          <div className="text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
