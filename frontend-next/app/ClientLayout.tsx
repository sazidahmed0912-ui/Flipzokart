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
import { GoogleOAuthProvider } from '@react-oauth/google';

/* ─── Offline Overlay ─────────────────────────────────────────── */
const OFFLINE_CSS = `
.fzk-offline-overlay {
  display: none;
  position: fixed; inset: 0; z-index: 99999;
  background: #ffffff;
  align-items: center; justify-content: center;
  font-family: 'PT Sans Caption', sans-serif;
  flex-direction: column;
  text-align: center;
}
.fzk-offline-overlay.active { display: flex; }
.fzk-offline-clip { display: inline-block; transform: skew(-45deg); }
.fzk-offline-shadow { height: 110px; width: 110px; overflow: hidden; }
.fzk-offline-digit {
  display: flex; align-items: center; justify-content: center;
  width: 90px; height: 90px; border-radius: 50%;
  background: #07B3F9; color: white; font-size: 52px; font-weight: bold;
  transform: skew(45deg); position: relative; top: 8%;
}
.fzk-offline-digits { display: flex; gap: 4px; justify-content: center; margin-bottom: 20px; }
.fzk-offline-msg {
  font-size: clamp(15px, 4vw, 22px); color: #535353; margin-top: 12px;
  max-width: 340px; padding: 0 16px; line-height: 1.5;
}
.fzk-offline-sub { font-size: 13px; color: #aaa; margin-top: 6px; }
.fzk-offline-retry {
  margin-top: 20px; padding: 10px 24px; border: none; border-radius: 8px;
  background: #07B3F9; color: white; font-size: 14px; cursor: pointer;
  font-weight: 600; letter-spacing: 0.04em;
}
.fzk-offline-retry:hover { background: #0599d9; }
`;

function OfflineOverlay({ isOnline, isSlowTimeout, onDismiss }: { 
  isOnline: boolean; 
  isSlowTimeout: boolean;
  onDismiss: () => void;
}) {
  const [d1, setD1] = useState<number | string>('');
  const [d2, setD2] = useState<number | string>('');
  const [d3, setD3] = useState<number | string>('');
  const show = !isOnline || isSlowTimeout;

  useEffect(() => {
    if (!show) return;
    const rnd = () => Math.floor(Math.random() * 9) + 1;
    let i = 0;
    const t = 35;
    const l3 = setInterval(() => { if (i > 40) { clearInterval(l3); setD3(4); } else { setD3(rnd()); i++; } }, t);
    const l2 = setInterval(() => { if (i > 80) { clearInterval(l2); setD2(0); } else { setD2(rnd()); } }, t);
    const l1 = setInterval(() => { if (i > 100) { clearInterval(l1); setD1(4); } else { setD1(rnd()); } }, t);
    return () => { clearInterval(l1); clearInterval(l2); clearInterval(l3); };
  }, [show]);

  const slowMsg = isSlowTimeout && isOnline;

  return (
    <div className={`fzk-offline-overlay${show ? ' active' : ''}`}>
      <style dangerouslySetInnerHTML={{ __html: OFFLINE_CSS }} />
      <div className="fzk-offline-digits">
        <div className="fzk-offline-clip"><div className="fzk-offline-shadow"><div className="fzk-offline-digit">{d3}</div></div></div>
        <div className="fzk-offline-clip"><div className="fzk-offline-shadow"><div className="fzk-offline-digit">{d2}</div></div></div>
        <div className="fzk-offline-clip"><div className="fzk-offline-shadow"><div className="fzk-offline-digit">{d1}</div></div></div>
      </div>
      {slowMsg ? (
        <>
          <p className="fzk-offline-msg">🐢 Sorry! Slow Network — Page took too long to load</p>
          <p className="fzk-offline-sub">Your connection is slow. Please wait or try again.</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="fzk-offline-retry" onClick={() => window.location.reload()}>Retry</button>
            <button className="fzk-offline-retry" style={{ background: '#aaa' }} onClick={onDismiss}>Go Back</button>
          </div>
        </>
      ) : (
        <>
          <p className="fzk-offline-msg">📡 Sorry! Network Error — Please check your internet connection</p>
          <p className="fzk-offline-sub">Turn on your data or connect to Wi-Fi to continue</p>
          <button className="fzk-offline-retry" onClick={() => window.location.reload()}>Retry</button>
        </>
      )}
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user, setUser } = useApp();
    const { showToast } = useNotifications();
    const [isOnline, setIsOnline] = useState(true);
    const [isSlowTimeout, setIsSlowTimeout] = useState(false);

    const handleSlowNetwork = React.useCallback(() => {
        setIsSlowTimeout(true);
    }, []);

    const handleDismiss = React.useCallback(() => {
        setIsSlowTimeout(false);
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline  = () => { setIsOnline(true); setIsSlowTimeout(false); };
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online',  handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online',  handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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

            // Dispatch custom event for persistent support
            window.dispatchEvent(new CustomEvent("show-toast", {
                detail: {
                    type: type,
                    message: notification.message,
                    persist: type === 'success' || type === 'error' // Persist critical messages across route changes
                }
            }));

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
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <Layout>
                <OfflineOverlay isOnline={isOnline} isSlowTimeout={isSlowTimeout} onDismiss={handleDismiss} />
                <Suspense fallback={<CircularGlassSpinner />}>
                    <PageTransition key={pathname} onSlowNetwork={handleSlowNetwork}>
                        {children}
                    </PageTransition>
                    <ToastListener />
                </Suspense>
            </Layout>
        </GoogleOAuthProvider>
    );
}
