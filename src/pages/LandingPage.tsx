import React from 'react';
import LandingNavbar from '@/components/layout/LandingNavbar';
import LandingHero from '@/components/layout/LandingHero';
import LandingFeatures from '@/components/layout/LandingFeatures';
import LandingTestimonials from '@/components/layout/LandingTestemonials';
import LandingFooter from '@/components/layout/LandingFooter';

export const LandingPage = ({ onStartCheckout }) => {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <LandingNavbar />
      {/* Hero Section */}
      <LandingHero />

      {/* Grid de Benefícios */}
        <section className="py-12 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">150+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Gráficas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">13.000+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Orçamentos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Suporte</div>
            </div>
          </div>
        </section>

        <LandingFeatures />

        <LandingTestimonials />

        <LandingFooter />
    </div>
  );
};

const BenefitCard = ({ title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
export default LandingPage;