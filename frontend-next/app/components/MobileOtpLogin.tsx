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

        // Global message listener debug
        const messageHandler = (event: MessageEvent) => {
            console.log("Global Window Message Received:", event.origin, event.data);
            try {
                if (typeof event.data === 'string' && event.data.includes('msg91')) {
                    alert("Received MSG91 Message: " + event.data);
                }
            } catch (e) {
                // ignore
            }
        };
        window.addEventListener("message", messageHandler);
        return () => window.removeEventListener("message", messageHandler);
    }, []);

    const openMobileOtp = () => {
        if (!isScriptLoaded || !(window as any).initSendOTP) {
            console.warn("MSG91 Script not loaded yet");
            return;
        }

        console.log("Initializing MSG91 OTP Widget... (Attempt 2 - Debug Mode)");

        try {
            const config = {
                widgetId: "3662616b7765363133313539",
                tokenAuth: "491551TGhhpXBdgY1697f3ab8P1",
                identifier: "mobile",
                exposeMethods: true,
                debug: true, // Try enabling debug mode if supported

                // Try multiple callback names just in case
                callback: (data: any) => handleSuccess(data, 'callback'),
                success: (data: any) => handleSuccess(data, 'success'),
                onSuccess: (data: any) => handleSuccess(data, 'onSuccess'),

                failure: (err: any) => handleFailure(err, 'failure'),
                onError: (err: any) => handleFailure(err, 'onError')
            };

            console.log("Calling initSendOTP with config:", config);
            (window as any).initSendOTP(config);

            console.log("MSG91 initSendOTP called. Checking for iframe...");
            setTimeout(() => {
                const iframes = document.querySelectorAll('iframe');
                console.log("Found iframes on page: " + iframes.length);
                iframes.forEach((ifr, i) => {
                    console.log(`Iframe ${i} src:`, ifr.src);
                    if (ifr.src.includes('msg91')) {
                        console.log("✅ MSG91 Iframe FOUND!");
                        (ifr as HTMLElement).style.zIndex = "999999"; // Force visibility
                        (ifr as HTMLElement).style.display = "block";
                    }
                });
            }, 2000);

        } catch (error) {
            console.error("Error calling initSendOTP:", error);
            alert("Error initializing OTP widget. See console.");
        }
    };

    const handleSuccess = async (data: any, source: string) => {
        console.log(`MSG91 Success via [${source}]:`, data);

        try {
            const res = await fetch("/api/mobile-otp-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: data.access_token || data, // Handle different data shapes
                }),
            });

            const result = await res.json();
            console.log("Backend verification result:", result);

            if (result.success) {
                alert("Mobile OTP Login Success ✅");
            } else {
                alert("Mobile OTP Failed ❌");
            }
        } catch (e) {
            console.error("Verification error:", e);
            alert("Verification error (Check console)");
        }
    };

    const handleFailure = (err: any, source: string) => {
        console.error(`MSG91 Failure via [${source}]:`, err);
        alert(`OTP Verification Failed (${source})`);
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
