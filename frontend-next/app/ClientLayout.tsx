"use client";
import React, { useEffect, Suspense, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout } from '@/app/components/Layout';
import { useApp } from '@/app/store/Context';
import { useNotifications } from '@/app/store/NotificationContext';
import { toast } from 'react-toastify';
import { useSocket } from '@/app/hooks/useSocket';
import authService from '@/app/services/authService';
import CircularGlassSpinner from '@/app/components/CircularGlassSpinner';
import PageTransition from '@/app/components/ui/PageTransition';
import ToastListener from '@/app/components/ToastListener';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, setUser } = useApp();
    const { showToast } = useNotifications();

    const pathname = usePathname();
    const router = useRouter();

    // GLOBAL: Real-time Status Sync (5s Poll)
    useEffect(() => {
        if (!user) return;
        const checkStatus = async () => {
            try {
                const freshUser = await authService.getMe();
                if (freshUser && (freshUser.status !== user.status || freshUser.suspensionEnd !== user.suspensionEnd)) {
                    console.log("Status update detected:", freshUser.status);
                    setUser(freshUser);
                }
            } catch (err) { }
        };
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [user, setUser]);

    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const socket = useSocket(token);

    useEffect(() => {
        if (!socket || !user) return;
        const handleNotification = (data: any) => {
            const isWarning = data?.type === 'warning';
            const notification = {
                _id: Date.now().toString(),
                recipient: user?.id,
                message: String(data?.message ?? "New notification"),
                type: String(data?.type ?? "info"),
                isRead: false,
                createdAt: new Date().toISOString(),
                status: (data?.type === "success" || data?.type === "error" || data?.type === "warning") ? data.type : "info",
            };

            const type = notification.status as any;
            if (type === 'success') toast.success(notification.message);
            else if (type === 'error') toast.error(notification.message);
            else if (type === 'warning' || type === 'warn') toast.warn(notification.message);
            else toast.info(notification.message);

            if (!isWarning) {
                // Ensure showToast exists on NotificationContext
                if (showToast) showToast(notification);
            }
        };
        socket.on("notification", handleNotification);
        return () => { socket.off("notification", handleNotification); };
    }, [socket, user, showToast]);

    useEffect(() => {
        if (user && (user.status === 'Banned' || user.status === 'Suspended')) {
            if (pathname !== '/banned') {
                router.push('/banned');
            }
        }
    }, [user, pathname, router]);

    return (
        <Layout>
            <Suspense fallback={<CircularGlassSpinner />}>
                <PageTransition key={pathname}>
                    {children}
                </PageTransition>
                <ToastListener />
            </Suspense>
        </Layout>
    );
}
