import React from 'react';
import Toast from './Toast';
import { ToastData } from './ToastContext';

interface ToastContainerProps {
    toasts: ToastData[];
    exitingToasts: Set<number>;
    onClose: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, exitingToasts, onClose }) => {
    return (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col items-center mt-4 pointer-events-none w-full">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onClose={onClose}
                    isExiting={exitingToasts.has(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
