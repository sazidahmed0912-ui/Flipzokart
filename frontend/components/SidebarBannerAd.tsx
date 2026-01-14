import React from 'react';

export const SidebarBannerAd: React.FC = () => {
  return (
    <div className="sticky top-24 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl p-6 shadow-xl border-4 border-white/20">
      <div className="text-center space-y-4">
        <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-xs font-bold mb-2">
          HOT DEAL
        </div>
        
        <h3 className="text-xl font-bold mb-2">Flash Sale!</h3>
        
        <div className="space-y-2 mb-4">
          <p className="text-2xl font-bold">50% OFF</p>
          <p className="text-sm opacity-90">Selected Items</p>
        </div>
        
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <p className="text-xs font-mono font-bold">FLASH50</p>
        </div>
        
        <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-yellow-50 transition-colors active:scale-95">
          Shop Now →
        </button>
        
        <p className="text-xs opacity-75 mt-3">
          ⏰ Limited time offer
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/20 rounded-full animate-bounce"></div>
    </div>
  );
};
