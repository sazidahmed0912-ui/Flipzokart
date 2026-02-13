"use client";
import React from 'react';
import { AppProvider } from '@/app/store/Context';
import { LanguageProvider } from '@/app/store/LanguageContext';
import { NotificationProvider } from '@/app/store/NotificationContext';
import { ToastProvider } from '@/app/components/toast';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
    return (

        <ErrorBoundary>
            <ToastProvider>
                <AppProvider>
                    <LanguageProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </LanguageProvider>
                </AppProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}
