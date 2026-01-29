const axios = require('axios');

// Cache account ID to avoid fetching it every time
let cachedAccountId = null;
let cachedAccessToken = null;
let tokenExpiryTime = 0;

const getAccessToken = async () => {
  // Return cached token if still valid (minus buffer time)
  if (cachedAccessToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedAccessToken;
  }

  console.log("Fetching new Zoho Access Token...");
  try {
    const params = new URLSearchParams();
    params.append('refresh_token', process.env.ZOHO_REFRESH_TOKEN);
    params.append('client_id', process.env.ZOHO_CLIENT_ID);
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post('https://accounts.zoho.in/oauth/v2/token', params);

    if (response.data.access_token) {
      cachedAccessToken = response.data.access_token;
      // Zoho tokens typically valid for 1 hour
      // If expires_in missing, default to 3600
      const expiresIn = response.data.expires_in || 3600;
      tokenExpiryTime = Date.now() + (expiresIn * 1000);
      return cachedAccessToken;
    } else {
      console.error("Token Response Data:", response.data);
      throw new Error('No access token returned. Check logs.');
    }
  } catch (error) {
    console.error('Error fetching Zoho Access Token:', error.response?.data || error.message);
    throw error;
  }
};

const getAccountId = async (accessToken) => {
  if (cachedAccountId) return cachedAccountId;

  console.log("Fetching Zoho Account ID...");
  try {
    // Updated URL for India DC. If generic fails, might need to try others, but .in is consistent with .env
    const response = await axios.get('https://mail.zoho.in/api/accounts', {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    if (response.data.data && response.data.data.length > 0) {
      // Find the account matching the FROM address if possible, else use first
      const account = response.data.data.find(a => a.incomingUserName === process.env.ZOHO_MAIL) || response.data.data[0];
      cachedAccountId = account.accountId;
      console.log("Account ID cached:", cachedAccountId);
      return cachedAccountId;
    } else {
      throw new Error('No Zoho Mail accounts found in response: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('Error fetching Zoho Account ID:', error.response?.data || error.message);
    throw error;
  }
};

const sendOrderConfirmationEmail = async (email, order) => {
  try {
    if (!email) {
      console.warn("No email provided for order confirmation.");
      return;
    }

    console.log(`Preparing to send email to ${email} via Zoho API...`);
    const token = await getAccessToken();
    const accountId = await getAccountId(token);

    // Safely access address fields
    const addr = order.shippingAddress || {};
    const addressHtml = `
            <p>
                <strong>${addr.fullName || addr.name || 'Customer'}</strong><br>
                ${addr.street || addr.address || ''}, ${addr.city || ''}<br>
                ${addr.state || ''} - ${addr.zipCode || addr.pincode || ''}<br>
                Phone: ${addr.phone || ''}
            </p>
        `;

    const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #2874F0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Order Confirmed!</h2>
                <p>Hi there,</p>
                <p>Thank you for shopping with Fzokart. Your order has been placed successfully.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-6)}</p>
                    <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p style="margin: 5px 0; font-size: 1.1em;"><strong>Total Amount:</strong> ₹${order.total}</p>
                </div>

                <h3>Delivery Address:</h3>
                ${addressHtml}

                <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                    You can track your order in your profile section.<br>
                    Team Fzokart
                </p>
            </div>
        `;

    const payload = {
      fromAddress: process.env.ZOHO_MAIL,
      toAddress: email,
      subject: `Order Confirmation - #${order._id.toString().slice(-6)}`,
      content: emailContent
    };

    const mailResponse = await axios.post(`https://mail.zoho.in/api/accounts/${accountId}/messages`, payload, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` }
    });

    console.log("Order confirmation email sent successfully via Zoho API. Status:", mailResponse.status);

  } catch (error) {
    console.error("Error sending order email via API:", error.response?.data || error.message);
  }
};

module.exports = { sendOrderConfirmationEmail };
