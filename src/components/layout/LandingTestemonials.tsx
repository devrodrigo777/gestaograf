
import React from 'react';

const testimonials = [
  {
    name: "Ana Júlia Soares",
    role: "Proprietária da AJ Gráfica",
    content: "O controle de orçamentos por m² mudou o meu jogo. Antes eu perdia horas no Excel, agora faço em segundos.",
    avatar: "https://i.pravatar.cc/150?u=carlos"
  },
  {
    name: "Carlos Eduardo",
    role: "Gerente de Produção",
    content: "O link de acompanhamento para os clientes reduziu as chamadas no WhatsApp em 70%. Eles amam ver o progresso acontecendo!",
    avatar: "https://i.pravatar.cc/150?u=ana"
  },
  {
    name: "Marcos Vinicius",
    role: "Gráfica Rápida Express",
    content: "Sistema leve, intuitivo e com suporte excelente. O dashboard me dá a visão real de quanto estou faturando.",
    avatar: "https://i.pravatar.cc/150?u=marcos"
  }
];

const LandingTestimonials: React.FC = () => {
  return (
    <section id="provas-sociais" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Quem usa, aprova.</h2>
          <p className="text-gray-600 text-lg">Histórias reais de negócios que escalaram com o GraficaPro.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <p className="text-gray-700 italic mb-8 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
