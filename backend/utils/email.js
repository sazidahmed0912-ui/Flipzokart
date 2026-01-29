const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.zoho.in',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: process.env.ZOHO_MAIL,
            clientId: process.env.ZOHO_CLIENT_ID,
            clientSecret: process.env.ZOHO_CLIENT_SECRET,
            refreshToken: process.env.ZOHO_REFRESH_TOKEN
        }
    });
};

const sendOrderConfirmationEmail = async (email, order) => {
    try {
        if (!email) {
            console.warn("No email provided for order confirmation.");
            return;
        }

        const transporter = createTransporter();

        // Safely access address fields supporting both structures
        const addr = order.shippingAddress || {};
        const addressHtml = `
      <p>
        <strong>${addr.fullName || addr.name || 'Customer'}</strong><br>
        ${addr.street || addr.address || ''}, ${addr.city || ''}<br>
        ${addr.state || ''} - ${addr.zipCode || addr.pincode || ''}<br>
        Phone: ${addr.phone || ''}
      </p>
    `;

        const mailOptions = {
            from: `"Fzokart" <${process.env.ZOHO_MAIL}>`,
            to: email,
            subject: `Order Confirmation - #${order._id.toString().slice(-6)}`,
            html: `
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
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent:", info.messageId);
    } catch (error) {
        console.error("Error sending order email:", error);
    }
};

module.exports = { sendOrderConfirmationEmail };
