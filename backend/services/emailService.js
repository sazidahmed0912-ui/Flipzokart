const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465, // Hardcoded to fix Render timeout
  secure: true, // Hardcoded to fix Render timeout
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4, // Force IPv4 to avoid IPv6 timeouts
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { sendEmail };
