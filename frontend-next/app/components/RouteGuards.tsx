"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin, isInitialized } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized) {
            if (!user || !isAdmin) {
                router.push('/login');
            }
        }
    }, [user, isAdmin, isInitialized, router]);

    if (!isInitialized) return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!user || !isAdmin) return null;

    return <>{children}</>;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;
    return <>{children}</>;
};
