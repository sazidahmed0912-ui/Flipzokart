"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ToastListener() {
    useEffect(() => {
        // 1. Check for persisted toast (e.g. after redirect/reload)
        const persisted = sessionStorage.getItem("pending_toast");
        if (persisted) {
            try {
                const { type, message } = JSON.parse(persisted);
                if (type === 'success') toast.success(message);
                else if (type === 'error') toast.error(message);
                else if (type === 'warning' || type === 'warn') toast.warn(message);
                else toast.info(message);
                sessionStorage.removeItem("pending_toast");
            } catch (e) {
                sessionStorage.removeItem("pending_toast");
            }
        }

        // 2. Listen for custom events
        const handler = (e: any) => {
            const type = e.detail.type || 'info';
            const message = e.detail.message;
            const persist = e.detail.persist; // New flag for persistence

            if (persist) {
                sessionStorage.setItem("pending_toast", JSON.stringify({ type, message }));
            }

            if (type === 'success') toast.success(message);
            else if (type === 'error') toast.error(message);
            else if (type === 'warning' || type === 'warn') toast.warn(message);
            else toast.info(message);
        };

        window.addEventListener("show-toast", handler);
        return () => window.removeEventListener("show-toast", handler);
    }, []);

    return null;
}
