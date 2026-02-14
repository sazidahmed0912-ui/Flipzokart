"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/store/Context";
import { createOrder } from "@/app/services/api";
import { useToast } from "@/app/components/toast";
import { CheckCircle2, Loader2 } from "lucide-react";

const PlaceOrderCodPage = () => {
    const router = useRouter();
    const { user, clearCart } = useApp();
    const { addToast } = useToast();
    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");

    useEffect(() => {
        // 🛡️ Security Check
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        const placeCodOrder = async () => {
            try {
                const pendingOrderStr = localStorage.getItem("pendingOrder");

                if (!pendingOrderStr) {
                    addToast("error", "Session expired or invalid order.");
                    router.replace("/checkout/payment");
                    return;
                }

                const orderPayload = JSON.parse(pendingOrderStr);

                // Create Order
                const { data } = await createOrder(orderPayload);

                // Cleanup
                localStorage.removeItem("pendingOrder");
                localStorage.removeItem("checkout_intent"); // Safety clear
                clearCart();

                setStatus("success");
                setTimeout(() => {
                    router.replace(`/order-success?orderId=${data.order.id}`);
                }, 1500);

            } catch (error: any) {
                console.error("Auto COD Order Failed", error);
                setStatus("failed");
                addToast("error", error.message || "Order placement failed");
                setTimeout(() => router.replace("/checkout/payment"), 2000);
            }
        };

        // Run once
        placeCodOrder();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center max-w-sm w-full border border-gray-100">

                {status === "processing" && (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Placing your Order...</h2>
                        <p className="text-gray-500 mt-2 text-sm">Please do not close this window.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800">Order Placed!</h2>
                        <p className="text-gray-500 mt-2 text-sm">Redirecting you to summary...</p>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500 font-bold text-2xl">!</div>
                        <h2 className="text-xl font-bold text-gray-800">Order Failed</h2>
                        <p className="text-gray-500 mt-2 text-sm">Redirecting to payment...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaceOrderCodPage;
