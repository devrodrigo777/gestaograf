
import React from 'react';
import { 
  Users, 
  Package, 
  Wrench, 
  ClipboardList, 
  DollarSign, 
  BarChart3, 
  Truck, 
  Database 
} from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Gestão de Clientes",
    description: "Cadastro completo com CPF/CNPJ, integração Supabase e busca instantânea."
  },
  {
    icon: <Package className="w-6 h-6 text-purple-600" />,
    title: "Gestão de Produtos",
    description: "Venda por unidade, m² ou metro linear. Sincronização em tempo real."
  },
  {
    icon: <Wrench className="w-6 h-6 text-orange-600" />,
    title: "Serviços Customizados",
    description: "Catalogação de serviços específicos da gráfica com preços flexíveis."
  },
  {
    icon: <ClipboardList className="w-6 h-6 text-emerald-600" />,
    title: "Orçamentos (Quotes)",
    description: "Multi-itens, timeline de produção e status visual do aguardando ao entregue."
  },
  {
    icon: <DollarSign className="w-6 h-6 text-pink-600" />,
    title: "Vendas e Pagamentos",
    description: "PIX, Cartão, Boleto e Dinheiro. Conversão direta de orçamento em venda."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-cyan-600" />,
    title: "Dashboard Analítico",
    description: "Gráficos interativos e estatísticas em tempo real para tomada de decisão."
  },
  {
    icon: <Truck className="w-6 h-6 text-indigo-600" />,
    title: "Tracking Público",
    description: "Link exclusivo para seus clientes acompanharem o status do pedido."
  },
  {
    icon: <Database className="w-6 h-6 text-slate-600" />,
    title: "Nuvem com Supabase",
    description: "Seus dados seguros e sincronizados com a melhor infraestrutura backend."
  }
];

const LandingFeatures: React.FC = () => {
  return (
    <section id="funcionalidades" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Tudo o que sua gráfica precisa.</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Elimine as planilhas e o papel. Ganhe tempo para focar no que realmente importa: produzir.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
