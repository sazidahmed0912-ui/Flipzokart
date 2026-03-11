const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

const fs = require("fs");
const keyPath = path.join(__dirname, "../config/analytics-service.json");

let analyticsDataClient = null;

if (fs.existsSync(keyPath)) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyPath
  });
} else {
  console.warn("⚠️ Google Analytics Service Account key missing. Using fallbacks.");
}

async function getActiveUsers() {
  if (!analyticsDataClient) {
    return 0;
  }
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: "properties/520375126",
      metrics: [{ name: "activeUsers" }]
    });

    return response.rows?.[0]?.metricValues?.[0]?.value || 0;
  } catch (err) {
    console.error("Error fetching GA Active Users:", err);
    throw err;
  }
}

module.exports = { getActiveUsers };
