import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer from './ToastContainer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [exitingToasts, setExitingToasts] = useState<Set<number>>(new Set());

    const removeToast = useCallback((id: number) => {
        // If already exiting, don't trigger again
        if (exitingToasts.has(id)) return;

        // 1. Mark as exiting to trigger exit animation
        setExitingToasts((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

        // 2. Wait for animation to complete (300ms) then remove from DOM
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
            setExitingToasts((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 300);
    }, [exitingToasts]);

    const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer
                toasts={toasts}
                exitingToasts={exitingToasts}
                onClose={removeToast}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
