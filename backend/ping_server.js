const axios = require('axios');

async function ping() {
    try {
        console.log("Health check...");
        const res = await axios.get('http://localhost:5000/health');
        console.log("✅ Server response:", res.data);
    } catch (e) {
        console.error("❌ Link check failed:", e.message);
    }
}
ping();
