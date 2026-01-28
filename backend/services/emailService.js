const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Built-in service support for Gmail
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds to connect
  greetingTimeout: 5000, // 5 seconds to wait for greeting
  socketTimeout: 10000, // 10 seconds of inactivity
});

const sendEmailOtp = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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
    console.log('✅ Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { sendEmailOtp };
