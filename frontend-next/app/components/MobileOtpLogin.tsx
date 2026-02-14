"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import Script from 'next/script';

export default function MobileOtpLogin() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualMobile, setManualMobile] = useState("");
    const [pendingToken, setPendingToken] = useState<any>(null);

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
                    console.log("Received MSG91 Message: " + event.data);
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
            // alert("Error initializing OTP widget. See console.");
        }
    };

    const { setUser, loginSequence } = useApp();
    const router = useRouter();
    const { addToast } = useToast();

    // const [manualMobile, setManualMobile] = useState(''); // Removed duplicate
    // const [showManualInput, setShowManualInput] = useState(false); // Removed duplicate
    // const [pendingToken, setPendingToken] = useState<any>(null); // Removed duplicate

    // Helper: Verify with Backend
    async function verifyBackend(tokenData: any, mobile: string) {
        const payload = {
            access_token: tokenData.access_token || tokenData?.message || tokenData,
            mobile: mobile
        };

        try {
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
                    await loginSequence(token, { ...user, phone: user.phone || mobile, authMethod: 'mobile-otp' });
                    addToast('success', `Login Successful!`);

                    // 🛒 CHECKOUT INTENT LOGIC
                    const checkoutIntentStr = localStorage.getItem("checkout_intent");
                    if (checkoutIntentStr) {
                        try {
                            const intent = JSON.parse(checkoutIntentStr);
                            if (intent.fromCheckout && intent.paymentMethod) {
                                addToast('success', 'Redirecting to checkout...');

                                if (intent.paymentMethod === "COD") {
                                    localStorage.removeItem("checkout_intent");
                                    window.location.href = "/checkout/place-order-cod";
                                    return;
                                }

                                if (intent.paymentMethod === "RAZORPAY") {
                                    localStorage.removeItem("checkout_intent");
                                    window.location.href = "/payment";
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error("Intent Parse Error", e);
                        }
                    }

                    // 🟢 FORCE HARD REDIRECT
                    window.location.href = "/profile";
                }
            } else {
                console.error("Login Failed:", result);

                // If backend verification failed, fallback to manual input
                if (result.message && (result.message.includes("Unable to verify") || result.message.includes("Verification Failed"))) {
                    console.warn("Backend identification failed. Requesting manual mobile input.");
                    addToast('info', "We couldn't detect your number automatically. Please confirm it below.");
                    setShowManualInput(true);
                } else {
                    if (result.debug) {
                        console.warn("🔍 BACKEND DEBUG INFO:", JSON.stringify(result.debug, null, 2));
                        addToast('error', `Login Failed: ${result.message} (See Console)`);
                    } else {
                        addToast('error', result.message || "Login Failed");
                    }
                }
            }
        } catch (e) {
            console.error("Backend Verification Exception:", e);
            addToast('error', "Backend Verification Failed");
        }
    }

    async function handleSuccess(data: any, source: string) {
        console.log("MSG91 RAW DATA: " + JSON.stringify(data, null, 2));
        setPendingToken(data); // Store token for manual retry if needed

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
                    }
                } catch (e) {
                    console.error("Failed to decode JWT token:", e);
                }
            }

            if (!mobile) {
                console.warn("Mobile number could not be detected on client. Sending token to backend.");
            }

            verifyBackend(data, mobile || "");

        } catch (e) {
            console.error("Verification error:", e);
            addToast('error', "Verification error");
        }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualMobile || manualMobile.length < 10) {
            addToast('error', "Please enter a valid mobile number");
            return;
        }
        // Retry verification with manually entered mobile
        verifyBackend(pendingToken, manualMobile);
    };

    const handleFailure = (err: any, source: string) => {
        console.error(`MSG91 Failure via [${source}]:`, err);
        const isIpBlocked = JSON.stringify(err).includes("408") || JSON.stringify(err).includes("IPBlocked");

        if (isIpBlocked) {
            addToast('error', `⚠️ IP BLOCKED BY MSG91. Please change network.`);
        } else {
            addToast('error', `OTP Verification Failed`);
        }
    };

    return (
        <>
            <Script
                src="https://control.msg91.com/app/assets/otp-provider/otp-provider.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log("MSG91 OTP Script Loaded");
                    setIsScriptLoaded(true);
                }}
                onError={(e) => {
                    console.error("MSG91 OTP Script Failed to Load", e);
                }}
            />

            {!showManualInput ? (
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
            ) : (
                <div style={{ marginTop: "15px" }}>
                    <form onSubmit={handleManualSubmit}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                            Confirm Mobile Number
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your mobile number"
                            value={manualMobile}
                            onChange={(e) => setManualMobile(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "4px",
                                border: "1px solid #ddd"
                            }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "10px",
                                background: "#25D366",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Complete Login
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
