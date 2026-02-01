import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { access_token, mobile } = body; // Expect mobile from client

        // Primary Auth Key from Env
        const primaryKey = process.env.MSG91_AUTH_KEY!;
        // Fallback Key (The one used in Widget TokenAuth) - mostly for debugging if primary fails
        const fallbackKey = "491551TGhhpXBdgY1697f3ab8P1";

        // Helper to verify
        const verifyWithKey = async (key: string) => {
            const res = await fetch(
                "https://control.msg91.com/api/v5/otp/verifyAccessToken",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authkey: key,
                    },
                    body: JSON.stringify({ access_token }),
                }
            );
            return await res.json();
        };

        // Try Primary Key
        let data = await verifyWithKey(primaryKey);
        console.log("MSG91 Verify (Primary) Result:", data);

        // If Primary Check Failed, Try Fallback
        if (data.type !== "success" && data.message !== "OTP verified successfully") {
            console.warn("Primary Key Failed. Trying Fallback Key...");
            const data2 = await verifyWithKey(fallbackKey);
            console.log("MSG91 Verify (Fallback) Result:", data2);

            if (data2.type === "success" || data2.message === "OTP verified successfully") {
                data = data2; // switch to successful data
            }
        }

        // MSG91 v5/v4 success check
        if (data.type === "success" || data.message === "OTP verified successfully" || data.status === "success") {

            // Backend Login requires mobile number
            // MSG91 verifyAccessToken might not return the mobile number, so we rely on what the client sent
            const mobileToLogin = mobile || data?.message?.mobile || data?.mobile;

            if (!mobileToLogin) {
                return NextResponse.json({ success: false, message: "Mobile number required for backend login. Please retry." });
            }

            const backendLoginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mobile-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: mobileToLogin })
            });

            const backendData = await backendLoginRes.json();

            if (backendLoginRes.ok && backendData.success) {
                return NextResponse.json({ success: true, data: backendData });
            } else {
                return NextResponse.json({ success: false, message: "Backend login failed", backendError: backendData });
            }
        }

        console.error("MSG91 Verification Failed:", data);
        return NextResponse.json({ success: false, message: data.message || "Verification failed", raw: data });
    } catch (err) {
        console.error("Route Error:", err);
        return NextResponse.json({ success: false, error: err }, { status: 500 });
    }
}
