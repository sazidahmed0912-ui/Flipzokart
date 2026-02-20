"use client";
import SellerDashboard from '@/app/_pages/SellerDashboard';
import { SellerAuthProvider } from '@/app/store/SellerAuthContext';
import { useEffect } from 'react';
import { useSellerAuth } from '@/app/store/SellerAuthContext';
import { useRouter } from 'next/navigation';

// Guard: redirect to /sell if seller not logged in
function SellerGuard({ children }: { children: React.ReactNode }) {
    const { isSellerLoggedIn, isSellerInitialized } = useSellerAuth();
    const router = useRouter();

    useEffect(() => {
        if (isSellerInitialized && !isSellerLoggedIn) {
            router.replace('/sell');
        }
    }, [isSellerInitialized, isSellerLoggedIn]);

    return <>{children}</>;
}

export default function SellerPanelPage() {
    return (
        // ✅ SellerAuthProvider is completely separate from AppProvider (main website)
        // No shared state, no shared tokens, no shared context
        <SellerAuthProvider>
            <SellerGuard>
                <SellerDashboard />
            </SellerGuard>
        </SellerAuthProvider>
    );
}
