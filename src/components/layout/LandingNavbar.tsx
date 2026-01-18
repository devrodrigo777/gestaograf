
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Gestão<span className="text-blue-600">Graf</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={ () => window.location.href = '/dashboard' } className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
              COMECE AGORA
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;