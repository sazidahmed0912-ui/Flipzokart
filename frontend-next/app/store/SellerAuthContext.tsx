"use client";

// ✅ SELLER AUTH CONTEXT — Completely separate from AppProvider/UserAuthContext
// No shared state with the main website auth system

import React, { createContext, useContext, useState, useEffect } from 'react';
import sellerAuthService from '@/app/services/sellerAuthService';
import { useRouter } from 'next/navigation';

interface SellerUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface SellerAuthContextType {
    sellerUser: SellerUser | null;
    sellerToken: string | null;
    isSellerLoggedIn: boolean;
    isSellerInitialized: boolean;
    sellerLogout: () => void;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

export function SellerAuthProvider({ children }: { children: React.ReactNode }) {
    const [sellerUser, setSellerUser] = useState<SellerUser | null>(null);
    const [sellerToken, setSellerToken] = useState<string | null>(null);
    const [isSellerInitialized, setIsSellerInitialized] = useState(false);
    const router = useRouter();

    // On mount: hydrate seller session from localStorage (seller-specific keys only)
    useEffect(() => {
        const token = sellerAuthService.getSellerToken();
        const user = sellerAuthService.getSellerUser();

        if (token && user) {
            setSellerToken(token);
            setSellerUser(user);
        }
        setIsSellerInitialized(true);
    }, []);

    // ✅ SELLER LOGOUT — clears ONLY seller_token and seller_user
    //    Main website "token" / "flipzokart_user" are NEVER touched
    const sellerLogout = () => {
        sellerAuthService.sellerLogout();
        setSellerUser(null);
        setSellerToken(null);
        router.replace('/sell');
    };

    return (
        <SellerAuthContext.Provider value={{
            sellerUser,
            sellerToken,
            isSellerLoggedIn: !!sellerToken,
            isSellerInitialized,
            sellerLogout,
        }}>
            {children}
        </SellerAuthContext.Provider>
    );
}

export const useSellerAuth = () => {
    const context = useContext(SellerAuthContext);
    if (!context) throw new Error('useSellerAuth must be used inside SellerAuthProvider');
    return context;
};
