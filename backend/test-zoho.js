require('dotenv').config();
const { sendEmail } = require('./services/emailService');

const testZoho = async () => {
    console.log('🔍 Testing Zoho OAuth2 Email...');
    console.log(`   User: ${process.env.ZOHO_MAIL}`);

    try {
        // Send a self-test email
        const testEmail = process.env.ZOHO_MAIL;
        console.log(`Sending test email to: ${testEmail}`);

        const result = await sendEmail(testEmail, 'Test Subject', '<h1>Zoho OAuth2 Test</h1>');
        console.log('🎉 Test Success! Email sent.');
    } catch (error) {
        console.error('💥 Test Failed:', error.message);
    }
};

testZoho();
