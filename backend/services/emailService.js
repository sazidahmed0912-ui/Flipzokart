const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: parseInt(process.env.EMAIL_PORT) === 465, // Auto-detect SSL based on port
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Force IPv4 to prevent potential IPv6 timeout issues on Cloud platforms like Render
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

const sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: `"Fzokart" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your Login OTP for Fzokart',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2874F0;">Fzokart Login Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
          ${otp}
        </div>
        <p>This OTP is valid for 5 minutes. Do not share this with anyone.</p>
        <p>If you didn't request this code, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Fzokart. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via Zoho: ' + info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email via Zoho:', error);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

module.exports = { sendEmailOtp };
