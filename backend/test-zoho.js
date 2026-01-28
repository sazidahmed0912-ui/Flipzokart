require('dotenv').config();
const { sendEmailOtp } = require('./services/emailService');

const testZoho = async () => {
    console.log('🔍 Testing Zoho SMTP (Port 465)...');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);

    try {
        // Send a self-test email
        const testEmail = process.env.EMAIL_USER;
        console.log(`Sending test email to: ${testEmail}`);

        const result = await sendEmailOtp(testEmail, '123456');
        console.log('🎉 Test Success! Email sent.');
        console.log('Result:', result);
    } catch (error) {
        console.error('💥 Test Failed:', error.message);
    }
};

testZoho();
