import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { access_token } = body;

        const response = await fetch(
            "https://control.msg91.com/api/v5/otp/verifyAccessToken",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authkey: process.env.MSG91_AUTH_KEY!,
                },
                body: JSON.stringify({ access_token }),
            }
        );

        const data = await response.json();

        if (data.type === "success") {
            // 👉 Existing user login / create here
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ success: false });
    } catch (err) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
