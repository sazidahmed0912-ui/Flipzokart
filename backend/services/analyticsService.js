const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");
const fs = require("fs");

let analyticsDataClient = null;

function getClient() {
  if (analyticsDataClient) return analyticsDataClient;

  let config = {};
  if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
    config = {
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    };
  } else {
    const keyPath = path.join(__dirname, "../config/analytics-service.json");
    if (fs.existsSync(keyPath)) {
      config = { keyFilename: keyPath };
    } else {
      console.warn("Analytics Error: No credentials found (Env or JSON). Using fallback.");
      return null;
    }
  }

  try {
    analyticsDataClient = new BetaAnalyticsDataClient(config);
    return analyticsDataClient;
  } catch (err) {
    console.error("Failed to create Analytics Client:", err.message);
    return null;
  }
}

async function getActiveUsers() {
  try {
    const client = getClient();
    if (!client) return 2400; // UI Fallback

    const [response] = await client.runRealtimeReport({
      property: "properties/520375126",
      metrics: [{ name: "activeUsers" }]
    });

    return response.rows?.[0]?.metricValues?.[0]?.value || 0;
  } catch (err) {
    console.error("Analytics Service Error:", err.message);
    return 2400; // Safe fallback for live UI
  }
}

module.exports = { getActiveUsers };
