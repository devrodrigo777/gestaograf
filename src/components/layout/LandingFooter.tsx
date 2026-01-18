
import React from 'react';

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">GestãoGraf</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6">
              Simplificando a gestão de pequenas gráficas por todo o Brasil. Gestão financeira, de estoque e produção em um só lugar.
            </p>
          </div>
          
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} | Criado com ♥ por <a href="https://linkedin.com/in/RodrigoLCA" target="_blank" rel="noopener noreferrer" className="hover:underline">@RodrigoLCA</a>. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
