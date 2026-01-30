"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin } = useApp();
    const router = useRouter();
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        // Wait for user load? Context initializes from localStorage synchronously.
        if (user !== undefined) {
            if (!user || !isAdmin) {
                router.push('/login');
            } else {
                setIsChecked(true);
            }
        }
    }, [user, isAdmin, router]);

    // If we want to strictly prevent render until check:
    // if (!isChecked) return null; 
    // But strictly, user might be null initially.
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
