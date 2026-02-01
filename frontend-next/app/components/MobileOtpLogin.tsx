"use client";

import React from 'react';

export default function MobileOtpLogin() {
    const openMobileOtp = () => {
        // Check if the MSG91 SDK is loaded
        if (!(window as any).initOtp) {
            alert("OTP loading, wait...");
            return;
        }

        (window as any).initOtp({
            widgetId: "3662616b7765363133313539",
            tokenAuth: "491551TGhhpXBdgY1697f3ab8P1",
            identifier: "mobile",
            exposeMethods: true,

            success: async (data: any) => {
                // MSG91 verified on client
                const res = await fetch("/api/mobile-otp-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: data.access_token,
                    }),
                });

                const result = await res.json();

                if (result.success) {
                    // 👉 yahan existing session / auth call karo
                    alert("Mobile OTP Login Success ✅");
                } else {
                    alert("Mobile OTP Failed ❌");
                }
            },

            failure: (err: any) => {
                console.error(err);
                alert("OTP verification failed");
            },
        });
    };

    return (
        <button
            type="button"
            onClick={openMobileOtp}
            style={{
                width: "100%",
                padding: "12px",
                marginTop: "10px",
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
            }}
        >
            Login with Mobile OTP
        </button>
    );
}
