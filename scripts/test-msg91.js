const axios = require('axios');

const MSG91_AUTH_KEY = "491551TGhhpXBdgY1697f3ab8P1"; // Key from codebase
const MOBILE = "9876543210"; // Test mobile (replace if needed, but using dummy for structure check)

async function testMsg91() {
    console.log("🔍 Testing MSG91 Config...");
    console.log(`🔑 Auth Key: ${MSG91_AUTH_KEY.substring(0, 4)}...`);

    try {
        // Standard V5 API Call
        const url = `https://control.msg91.com/api/v5/otp?mobile=91${MOBILE}`;
        console.log(`📡 Sending POST to: ${url}`);

        const response = await axios.post(
            url,
            {}, // Default template
            {
                headers: {
                    "authkey": MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Response Status:", response.status);
        console.log("✅ Response Data:", JSON.stringify(response.data, null, 2));

        if (response.data.type === 'success') {
            console.log("🎉 OTP Send SUCCESS! Config is likely correct.");
        } else {
            console.log("⚠️ OTP Send FAILED by Provider.");
        }

    } catch (error) {
        console.error("❌ Request Failed:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("   Error:", error.message);
        }
    }
}

testMsg91();
