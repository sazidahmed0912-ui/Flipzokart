import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  show?: boolean;
  isOpen?: boolean; // Support both for compatibility
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, isOpen, onClose, children }) => {
  const isVisible = show || isOpen; // Handle both prop names

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (isVisible && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 md:bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative bg-white w-full md:w-auto md:min-w-[480px] lg:min-w-[640px] md:max-w-lg lg:max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] lg:max-h-[80vh] z-10 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky Close Button Area */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-8 lg:p-10 overscroll-contain">
          {/* Add top padding to avoid close button overlap if no header */}
          <div className="mt-2 text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
