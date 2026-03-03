const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  console.log('Testing email configuration...');
  console.log('User:', process.env.EMAIL_USER);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER or EMAIL_PASS environment variables are missing.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('✅ Connection successful. SMTP is ready.');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'MindPulse Email Test',
      text: 'This is a test email from the MindPulse diagnostic script.',
    };

    console.log('Sending test email to self...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication Error: Please check if the App Password is correct and Google account allows SMTP.');
    }
  }
};

testEmail();
