import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '@/app/store/NotificationContext';

const Toast: React.FC<{ toast: any; hideToast: (id: string) => void }> = ({ toast, hideToast }) => {
  const getIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" />;
      case 'error':
        return <XCircle className="text-red-500" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" />;
      case 'info':
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const getBackgroundColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-center justify-between p-4 mb-2 rounded-lg shadow-md ${getBackgroundColor(toast.status)} border border-gray-200 w-full max-w-[calc(100vw-2rem)] sm:max-w-xs md:max-w-sm`}
    >
      <div className="flex items-center">
        <div className="mr-3">{getIcon(toast.status)}</div>
        <p className="text-sm font-medium text-gray-800">{toast.message}</p>
      </div>
      <button onClick={() => hideToast(toast.id)} className="text-gray-400 hover:text-gray-600 ml-4">
        <X size={18} />
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} hideToast={hideToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;