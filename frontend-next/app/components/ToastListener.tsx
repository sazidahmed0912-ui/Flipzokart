"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ToastListener() {
    useEffect(() => {
        const handler = (e: any) => {
            const type = e.detail.type || 'info';
            const message = e.detail.message;

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
