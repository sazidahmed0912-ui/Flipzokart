const axios = require('axios');

// Cache for Account ID to avoid repeated calls
let cachedAccountId = null;

/**
 * Generate a fresh Access Token using the Refresh Token
 */
const getAccessToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN);
    params.append('client_id', process.env.ZOHO_CLIENT_ID);
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', params, {
      timeout: 15000 // 15s timeout
    });

    if (response.data.error) {
      throw new Error(`Zoho Token Error: ${response.data.error}`);
    }

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Zoho Access Token:", error.message);
    throw error;
  }
};

/**
 * Fetch the Account ID associated with the email address
 */
const getAccountId = async (accessToken) => {
  if (cachedAccountId) return cachedAccountId;

  try {
    const response = await axios.get('https://mail.zoho.in/api/accounts', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`
      },
      timeout: 15000
    });

    const accounts = response.data.data;
    if (!accounts || accounts.length === 0) {
      throw new Error("No Zoho Mail accounts found.");
    }

    // Use the first account or match specific ZOHO_MAIL if needed
    // For now, simple default to first account
    cachedAccountId = accounts[0].accountId;
    return cachedAccountId;
  } catch (error) {
    console.error("Error fetching Zoho Account ID:", error.message);
    throw error;
  }
};

/**
 * Send Email using requests (Axios) to Zoho Mail API
 */
const sendEmail = async (to, subject, html) => {
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();

    // 2. Get Account ID
    const accountId = await getAccountId(accessToken);

    // 3. Send Email
    const url = `https://mail.zoho.in/api/accounts/${accountId}/messages`;

    const emailData = {
      fromAddress: process.env.ZOHO_MAIL,
      toAddress: to,
      subject: subject,
      content: html
    };

    const response = await axios.post(url, emailData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    // Zoho API returns 200 even for some failures, check body structure
    // Usually data: { status: { code: 200, description: "Success" } }
    if (response.data.status && response.data.status.code !== 200) {
      throw new Error(`Zoho Mail Send Failed: ${JSON.stringify(response.data.status)}`);
    }

    console.log(`📧 Email sent successfully to ${to}`);
    return response.data;

  } catch (error) {
    console.error("Error sending email via Zoho API:", error.response?.data || error.message);
    throw error; // Re-throw to handle in controller if needed
  }
};

module.exports = { sendEmail };
