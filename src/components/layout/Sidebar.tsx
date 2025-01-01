import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  Wrench,
  FileText,
  DollarSign,
  BarChart3,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: Package, label: 'Produtos', path: '/produtos' },
  { icon: Wrench, label: 'Serviços', path: '/servicos' },
  { icon: FileText, label: 'Orçamentos', path: '/orcamentos' },
  { icon: DollarSign, label: 'Vendas', path: '/vendas' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-sidebar-bg min-h-screen flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="bg-sidebar-header p-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-200 to-amber-100 flex items-center justify-center">
            <span className="text-2xl">🖨️</span>
          </div>
        </div>
      </div>

      {/* Company Name */}
      {!collapsed && (
        <div className="text-center py-3 border-b border-white/10">
          <h2 className="text-sidebar-header font-semibold text-sm">Gráfica Express</h2>
          <p className="text-sidebar-text text-xs">Sistema de Gestão</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                'text-sidebar-text hover:text-sidebar-text-hover hover:bg-white/5',
                isActive && 'bg-primary text-white',
                collapsed && 'justify-center'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-white/10 text-sidebar-text hover:text-sidebar-text-hover transition-colors flex items-center justify-center"
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-sidebar-text text-xs">© 2024 Gráfica Express</p>
          <p className="text-sidebar-text/60 text-xs">v1.0.0</p>
        </div>
      )}
    </aside>
  );
}
