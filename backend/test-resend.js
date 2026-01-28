require('dotenv').config();
const { sendEmailOtp } = require('./services/emailService');

const testResend = async () => {
    console.log('🔍 Testing Resend API...');
    try {
        // Send to the configured FROM address as a self-test since we are in sandbox
        // NOTE: In Resend Sandbox, you can only send to yourself unless you verify a domain
        const testEmail = 'fzokart@gmail.com';
        console.log(`Sending test email to: ${testEmail}`);

        const result = await sendEmailOtp(testEmail, '123456');
        console.log('🎉 Test Success! Result:', result);
    } catch (error) {
        console.error('💥 Test Failed:', error.message);
    }
};

testResend();
