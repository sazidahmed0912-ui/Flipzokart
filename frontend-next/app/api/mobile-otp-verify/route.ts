import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { access_token, mobile } = body;

        if (!access_token) {
            return NextResponse.json({
                success: false,
                message: "Access token missing"
            }, { status: 400 });
        }

        // 🟢 STEP 2: Backend Verification Skipped (As per instructions)
        // "access_token milna hi OTP success hai"

        // Attempt Backend Login (To create session)
        let mobileToLogin = mobile;

        // Try to decode token if mobile not provided
        if (!mobileToLogin) {
            try {
                // Simple base64 decode of JWT payload
                const parts = access_token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    // Check common fields for mobile number
                    mobileToLogin = payload.mobile || payload.phone || payload.contact_number;
                }
            } catch (e) {
                // Ignore decode errors
            }
        }

        // If we have a mobile number, perform the actual backend login
        if (mobileToLogin) {
            const backendLoginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/mobile-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: mobileToLogin })
            });

            const backendData = await backendLoginRes.json();

            if (backendLoginRes.ok && backendData.success) {
                return NextResponse.json({ success: true, data: backendData });
            } else {
                // If backend says "User not found" (Strict Login), we must return failure
                // so the Frontend can show the "Alert: Please Sign Up"
                return NextResponse.json({
                    success: false,
                    message: backendData.message || "Login failed",
                    isUserNotFound: backendLoginRes.status === 404
                });
            }
        }

        // 🟢 If NO Mobile number found in token/request, we can't login.
        // And since we now enforce "Login only if registered", we can't just return success blindly.
        return NextResponse.json({
            success: false,
            message: "Unable to verify user identity (No phone number found)"
        });

    } catch (err) {
        console.error("Route Error:", err);
        return NextResponse.json({
            success: false,
            message: "Verification failed"
        }, { status: 500 });
    }
}
