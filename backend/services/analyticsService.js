const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, "../config/analytics-service.json")
});

async function getActiveUsers() {
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
