"use client";
import { useEffect } from "react";
import { useToast } from "@/app/components/toast";

export default function ToastListener() {
    const { addToast } = useToast();

    useEffect(() => {
        const handler = (e: any) => {
            addToast(e.detail.type || 'info', e.detail.message);
        };

        window.addEventListener("show-toast", handler);
        return () => window.removeEventListener("show-toast", handler);
    }, [addToast]);

    return null;
}
