import React from 'react';
import { X } from 'lucide-react';

interface BannerAdProps {
  onClose?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              LIMITED TIME
            </span>
            <div>
              <p className="font-bold text-lg">🎉 MEGA SALE EVENT 🎉</p>
              <p className="text-sm opacity-90">Get up to 70% OFF on all products! Use code: <span className="font-bold text-yellow-300">MEGA70</span></p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full animate-ping"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
