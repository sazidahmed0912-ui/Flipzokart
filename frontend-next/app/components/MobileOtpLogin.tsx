"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';

export default function MobileOtpLogin() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        // Check if already loaded from cache or other navigations
        if ((window as any).initSendOTP) {
            setIsScriptLoaded(true);
        }
    }, []);

    const openMobileOtp = () => {
        if (!isScriptLoaded || !(window as any).initSendOTP) {
            alert("OTP widget is still loading. Please wait...");
            return;
        }

        (window as any).initSendOTP({
            widgetId: "3662616b7765363133313539",
            tokenAuth: "491551TGhhpXBdgY1697f3ab8P1",
            identifier: "mobile",
            exposeMethods: true,

            success: async (data: any) => {
                const res = await fetch("/api/mobile-otp-verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        access_token: data.access_token,
                    }),
                });

                const result = await res.json();

                if (result.success) {
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
        <>
            <Script
                src="https://control.msg91.com/app/assets/otp-provider/otp-provider.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("MSG91 OTP Script Loaded");
                    setIsScriptLoaded(true);
                }}
                onError={(e) => {
                    console.error("MSG91 OTP Script Failed to Load", e);
                }}
            />
            <button
                type="button"
                onClick={openMobileOtp}
                disabled={!isScriptLoaded}
                style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "10px",
                    background: isScriptLoaded ? "#25D366" : "#9ca3af",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: isScriptLoaded ? "pointer" : "not-allowed",
                    transition: "background 0.3s"
                }}
            >
                {isScriptLoaded ? "Login with Mobile OTP" : "Loading OTP Widget..."}
            </button>
        </>
    );
}
