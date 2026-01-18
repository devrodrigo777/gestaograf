
import React from 'react';

const LandingHero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Novo: Clientes podem acompanhar seus pedidos em tempo real!
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Sua Gráfica no <span className="gradient-text">Piloto Automático.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          Gerencie clientes, orçamentos, estoque e vendas em um só lugar. A solução completa para gráficas que buscam produtividade e lucratividade.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={ () => window.location.href = '/dashboard' }
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1">
            ACESSE AGORA MESMO
          </button>
          <button disabled={true} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all">
            Ver Demonstração
          </button>
        </div>

        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-100/50">
           <img 
            src="/assets/dashboard.jpg" 
            alt="GraficaPro Dashboard" 
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;