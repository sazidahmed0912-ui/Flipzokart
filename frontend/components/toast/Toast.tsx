import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastType } from './ToastContext';

interface ToastProps {
    id: number;
    type: ToastType;
    message: string;
    onClose: (id: number) => void;
    isExiting: boolean;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, isExiting }) => {
    // Styles configuration based on type
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-l-4 border-green-500',
            text: 'text-green-500',
            hoverClose: 'hover:text-green-700',
            icon: <CheckCircle className="w-6 h-6 text-green-500" />,
            animation: 'animate-slideDown',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-l-4 border-red-500',
            text: 'text-red-500',
            hoverClose: 'hover:text-red-700',
            icon: <AlertCircle className="w-6 h-6 text-red-500" />,
            animation: 'animate-slideDownShake',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-l-4 border-yellow-500',
            text: 'text-yellow-500',
            hoverClose: 'hover:text-yellow-700',
            icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
            animation: 'animate-slideDownShake',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-l-4 border-blue-500',
            text: 'text-blue-500',
            hoverClose: 'hover:text-blue-700',
            icon: <Info className="w-6 h-6 text-blue-500" />,
            animation: 'animate-slideDown',
        },
    };

    const config = styles[type];

    // If exiting, override animation to slideUp
    const animationClass = isExiting ? 'animate-slideUp' : config.animation;

    return (
        <>
            <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDownShake {
          0% { transform: translateY(-100%); opacity: 0; }
          60% { transform: translateY(0); opacity: 1; }
          70% { transform: translateY(0) translateX(-5px); }
          75% { transform: translateY(0) translateX(5px); }
          80% { transform: translateY(0) translateX(-5px); }
          85% { transform: translateY(0) translateX(5px); }
          90% { transform: translateY(0) translateX(-3px); }
          95% { transform: translateY(0) translateX(3px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes slideUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        .animate-slideDownShake {
          animation: slideDownShake 0.7s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-in forwards;
        }
      `}</style>

            <div
                className={`
          flex items-center justify-between
          min-w-[320px] max-w-md w-full
          p-4 mb-3 rounded-lg shadow-lg
          transition-all duration-300 hover:scale-105
          ${config.bg} ${config.border}
          ${animationClass}
          pointer-events-auto
        `}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {config.icon}
                    </div>
                    <p className="font-medium text-gray-800 text-sm leading-snug">
                        {message}
                    </p>
                </div>

                <button
                    onClick={() => onClose(id)}
                    className={`ml-4 p-1 rounded-full transition-colors ${config.text} ${config.hoverClose} hover:bg-white/50 focus:outline-none`}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </>
    );
};

export default Toast;
