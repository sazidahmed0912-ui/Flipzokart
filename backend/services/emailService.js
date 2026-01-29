const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "Zoho",
  auth: {
    type: "OAuth2",
    user: process.env.ZOHO_MAIL,
    clientId: process.env.ZOHO_CLIENT_ID,
    clientSecret: process.env.ZOHO_CLIENT_SECRET,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.ZOHO_MAIL,
      to,
      subject,
      html
    });
  } catch (error) {
    throw error;
  }
};

module.exports = { sendEmail };
