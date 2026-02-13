"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';
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

        console.log("Initializing MSG91 OTP Widget... (Attempt 4 - Log Check)");

        try {
            const config = {
                widgetId: "3662616b7765363133313539",
                tokenAuth: "491551TGhhpXBdgY1697f3ab8P1",
                identifier: "mobile",
                exposeMethods: false,

                success: (data: any) => handleSuccess(data, 'widget_success_v4'),
                failure: (err: any) => handleFailure(err, 'widget_failure_v4')
            };

            console.log("Calling initSendOTP with STANDARD config v4:", config);

            // Invoke
            (window as any).initSendOTP(config);

            // Manual fallback measure: Check if a global variable 'OTPWidget' or similar was created
            console.log("Window keys after init:", Object.keys(window).filter(k => k.toLowerCase().includes('otp')));


        } catch (error) {
            console.error("Error calling initSendOTP:", error);
            alert("Error initializing OTP widget. See console.");
        }
    };

    const { setUser } = useApp();
    const router = useRouter();

    const handleSuccess = async (data: any, source: string) => {
        console.log("MSG91 RAW DATA: " + JSON.stringify(data, null, 2));

        try {
            // Extract mobile if available
            let mobile = data.mobile || data?.message?.mobile;

            // 🟢 Fallback: Parsed JWT if mobile is missing
            if (!mobile && (typeof data.message === 'string' || typeof data === 'string')) {
                try {
                    const token = data.message || data;
                    if (token && typeof token === 'string' && token.includes('.')) {
                        const base64Url = token.split('.')[1];
                        if (base64Url) {
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                            }).join(''));
                            const parsed = JSON.parse(jsonPayload);
                            mobile = parsed.mobile || parsed.phone || parsed.contact_number;
                        }
                    } else {
                        console.warn("Mobile OTP: Token format invalid for mobile extraction", token);
                    }
                } catch (e) {
                    console.error("Failed to decode JWT token:", e);
                }
            }

            // 🟢 Fallback 2: Manual Entry
            if (!mobile) {
                const manualMobile = window.prompt("Confirmed! Enter mobile to complete login:");
                if (manualMobile) mobile = manualMobile.trim();
                else return;
            }

            const payload = {
                access_token: data.access_token || data?.message || data,
                mobile: mobile
            };

            const res = await fetch("/api/mobile-otp-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                const token = result.data?.token;
                const user = result.data?.user;

                if (token) {
                    // ✅ IMPORTANT — token save
                    localStorage.setItem("token", token);

                    // ✅ IMPORTANT — user state update
                    // Ensure phone is preserved
                    const finalUser = { ...user, phone: user.phone || mobile };
                    setUser(finalUser);

                    alert(`Login Successful! Welcome ${finalUser.name || 'User'}`);

                    // ✅ Redirect to profile (using router.replace as requested)
                    router.replace("/profile");
                }
            } else {
                alert(result.message || "Login Failed");
            }
        } catch (e) {
            console.error("Verification error:", e);
            alert("Verification error");
        }
    };

    const handleFailure = (err: any, source: string) => {
        console.error(`MSG91 Failure via [${source}]:`, err);
        // 🟢 UX IMPROVEMENT: Suggest IP Fix
        const isIpBlocked = JSON.stringify(err).includes("408") || JSON.stringify(err).includes("IPBlocked");

        if (isIpBlocked) {
            alert(`⚠️ IP BLOCKED BY MSG91 (Error 408)\n\nYou are temporarily blocked. Please change your Internet/Network and try again.`);
        } else {
            alert(`OTP Verification Failed (${source})`);
        }
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
