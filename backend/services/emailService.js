const { Resend } = require('resend');

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailOtp = async (email, otp) => {
  const htmlContent = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fzokart <onboarding@resend.dev>', // Fallback to testing domain until user verifies valid domain
      to: [email],
      subject: 'Your Login OTP for Fzokart',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email sent via Resend:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err);

    // Friendly error for Sandbox Mode
    if (err.message && err.message.includes('only send testing emails to your own email address')) {
      throw new Error('Sandbox Mode: Can only send OTP to fzokart@gmail.com. Please verify domain in Resend.');
    }

    throw new Error(err.message);
  }
};

module.exports = { sendEmailOtp };
