import { useState, useEffect } from 'react';

type ConnectionType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
type EffectiveConnectionType = '2g' | '3g' | '4g' | 'slow-2g';

interface NetworkInformation extends EventTarget {
    type?: ConnectionType;
    effectiveType?: EffectiveConnectionType;
    saveData?: boolean;
    downlink?: number;
    rtt?: number;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => void;
}

interface NetworkStatus {
    isOnline: boolean;
    isSlow: boolean;
    connectionType: EffectiveConnectionType | 'unknown';
    saveData: boolean;
}

const getNavigatorConnection = (): NetworkInformation | undefined => {
    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
};

export const useNetworkStatus = (): NetworkStatus => {
    const [status, setStatus] = useState<NetworkStatus>(() => {
        const connection = getNavigatorConnection();
        const effectiveType = connection?.effectiveType || '4g'; // Assume 4g if unknown
        const saveData = connection?.saveData || false;

        return {
            isOnline: navigator.onLine,
            isSlow: effectiveType === 'slow-2g' || effectiveType === '2g' || saveData,
            connectionType: effectiveType || 'unknown',
            saveData,
        };
    });

    useEffect(() => {
        const connection = getNavigatorConnection();

        const updateStatus = () => {
            const effectiveType = connection?.effectiveType || '4g';
            const saveData = connection?.saveData || false;

            setStatus({
                isOnline: navigator.onLine,
                isSlow: effectiveType === 'slow-2g' || effectiveType === '2g' || saveData,
                connectionType: effectiveType || 'unknown',
                saveData,
            });
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        if (connection) {
            connection.addEventListener('change', updateStatus);
        }

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            if (connection) {
                connection.removeEventListener('change', updateStatus);
            }
        };
    }, []);

    return status;
};
