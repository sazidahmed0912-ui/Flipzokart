"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/store/Context';
import { useToast } from '@/app/components/toast';
import Script from 'next/script';

export default function MobileOtpLogin() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [mobileInput, setMobileInput] = useState('');
    const [otpStep, setOtpStep] = useState<'input' | 'widget'>('input');

    // Global message listener for debug
    useEffect(() => {
        if ((window as any).initSendOTP) {
            setIsScriptLoaded(true);
        }
    }, []);

    const { setUser, loginSequence } = useApp();
    const router = useRouter();
    const { addToast } = useToast();

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
                    }
                } catch (e) {
                    console.error("Failed to decode JWT token:", e);
                }
            }

            // 🟢 Fallback 2: Use Manual Input if available
            if (!mobile && mobileInput) {
                console.log("Using manual input as fallback mobile:", mobileInput);
                mobile = mobileInput;
            }

            if (!mobile) {
                addToast('error', 'Could not detect mobile number. Please try again.');
                return;
            }

            verifyBackend(data, mobile);

        } catch (e) {
            console.error("Verification error:", e);
            addToast('error', "Verification error");
        }
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

    const handleInputSubmit = () => {
        if (!mobileInput || mobileInput.length < 10) {
            addToast('error', 'Please enter a valid 10-digit mobile number');
            return;
        }

        if (!isScriptLoaded || !(window as any).initSendOTP) {
            addToast('error', 'OTP Service loading...');
            return;
        }

        console.log("Launching MSG91 with Mobile:", mobileInput);

        try {
            // 1. Initialize Widget with Manual Methods Exposed
            const config = {
                widgetId: "3662616b7765363133313539",
                tokenAuth: "491551TGhhpXBdgY1697f3ab8P1",
                identifier: "mobile",
                exposeMethods: true, // 🟢 Enable Manual Control
                success: (data: any) => handleSuccess(data, 'widget_success_v4'),
                failure: (err: any) => handleFailure(err, 'widget_failure_v4')
            };

            (window as any).initSendOTP(config);

            // 2. Call sendOTP directly to BYPASS input screen
            // args: (mobileNumber, countryCode)
            // Note: sendOTP expects country code as 2nd arg or mobile with country code?
            // checking docs: sendOTP(mobileNumber, countryCode)

            setTimeout(() => {
                if ((window as any).sendOTP) {
                    (window as any).sendOTP(mobileInput, "91"); // 🟢 Strict Bypass
                    setOtpStep('widget');
                } else {
                    console.error("sendOTP method not found even after exposeMethods:true");
                    // Fallback to init if sendOTP fails
                    const fallbackConfig = {
                        ...config,
                        exposeMethods: false,
                        countryCode: "91",
                        mobile: "91" + mobileInput
                    };
                    (window as any).initSendOTP(fallbackConfig);
                }
            }, 100); // Small delay to ensure init completes

        } catch (error) {
            console.error("Error launching OTP widget:", error);
            addToast('error', 'Failed to launch OTP service');
        }
    };

    const verifyBackend = async (tokenData: any, mobile: string) => {
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
                                    router.replace("/checkout/place-order-cod");
                                    return;
                                }

                                if (intent.paymentMethod === "RAZORPAY") {
                                    localStorage.removeItem("checkout_intent");
                                    router.replace("/payment");
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error("Intent Parse Error", e);
                        }
                    }

                    if (result.authMethod === 'mobile-otp' || user.authMethod === 'mobile-otp') {
                        router.replace("/profile");
                        return;
                    }
                    router.replace("/profile");
                }
            } else {
                addToast('error', result.message || "Login Failed");
            }
        } catch (e) {
            addToast('error', "Backend Verification Failed");
        }
    };

    const [showMobileOTP, setShowMobileOTP] = useState(false);

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

            <div className="w-full mt-2">
                {/* 🟢 TRIGGER BUTTON (Visible Only When Closed) */}
                {!showMobileOTP && (
                    <button
                        type="button"
                        onClick={() => setShowMobileOTP(true)}
                        className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <span className="w-5 h-5 flex items-center justify-center bg-green-100 rounded-full text-green-600 group-hover:bg-green-200 transition-colors">
                            📱
                        </span>
                        Login with Mobile OTP
                    </button>
                )}

                {/* 🟢 EXPANDABLE SECTION (Input + Get OTP) */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${showMobileOTP ? 'max-h-[160px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                >
                    <div className="p-1">
                        {/* Custom Input */}
                        <div className="relative flex items-center mb-3 border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                            <div className="bg-gray-100 px-3 py-3 border-r border-gray-200 text-gray-600 font-medium text-sm flex items-center">
                                🇮🇳 +91
                            </div>
                            <input
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                className="w-full p-3 text-sm outline-none bg-white text-gray-800 placeholder-gray-400 font-medium tracking-wide"
                                value={mobileInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setMobileInput(val);
                                }}
                                disabled={!isScriptLoaded}
                                maxLength={10}
                                autoFocus={showMobileOTP}
                            />
                        </div>

                        {/* Get OTP Button */}
                        <button
                            type="button"
                            onClick={handleInputSubmit}
                            disabled={!isScriptLoaded || mobileInput.length < 10}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: (isScriptLoaded && mobileInput.length === 10) ? "#25D366" : "#9ca3af",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: (isScriptLoaded && mobileInput.length === 10) ? "pointer" : "not-allowed",
                                transition: "all 0.3s",
                                boxShadow: (isScriptLoaded && mobileInput.length === 10) ? "0 4px 6px rgba(37, 211, 102, 0.2)" : "none"
                            }}
                            className="flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98]"
                        >
                            {isScriptLoaded ? "Get OTP" : "Loading Service..."}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
