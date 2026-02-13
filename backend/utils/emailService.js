const nodemailer = require('nodemailer');

// Configure email transporter
// For development/testing, you can use Gmail or other email services
// Make sure to set SMTP credentials in .env file
const transporter = nodemailer.createTransport({
  // Using Gmail SMTP - you can change this to your preferred email service
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password', // Use Gmail App Password, not regular password
  },
});

// Alternative: For testing without real email, use ethereal.email
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send OTP email for password reset
 * @param {string} email - User's email address
 * @param {string} otp - One-time password to send
 * @returns {Promise<Object>} - Mail response
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mindpulse.com',
      to: email,
      subject: '🔐 MindPulse Password Reset - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
              }
              h1 {
                color: #f8fafc;
                margin: 0;
                font-size: 24px;
              }
              .subtitle {
                color: #94a3b8;
                margin-top: 8px;
              }
              .otp-box {
                background: rgba(99, 102, 241, 0.15);
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: 8px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 42px;
                font-weight: bold;
                color: #6366f1;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
              }
              .otp-label {
                color: #94a3b8;
                font-size: 14px;
                margin-top: 10px;
              }
              .info-box {
                background: rgba(248, 113, 113, 0.1);
                border-left: 4px solid #f87171;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
              }
              .info-text {
                color: #fca5a5;
                margin: 0;
                font-size: 14px;
              }
              .features {
                background: rgba(74, 222, 128, 0.1);
                border-left: 4px solid #4ade80;
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
              }
              .feature-text {
                color: #86efac;
                margin: 8px 0;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
              .footer-text {
                color: #64748b;
                font-size: 12px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🧠 MindPulse</div>
                <h1>Reset Your Password</h1>
                <p class="subtitle">Your account security is important to us</p>
              </div>

              <p style="color: #f8fafc; margin: 0 0 20px 0;">
                We received a request to reset your password. Use the code below to proceed:
              </p>

              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Valid for 10 minutes</div>
              </div>

              <div class="info-box">
                <p class="info-text">⏰ Never share this code with anyone. MindPulse support will never ask for it.</p>
              </div>

              <div class="features">
                <p class="feature-text">✓ This code expires in 10 minutes</p>
                <p class="feature-text">✓ Use it only once for security</p>
                <p class="feature-text">✓ If you didn't request this, ignore this email</p>
              </div>

              <p style="color: #94a3b8; margin: 20px 0; font-size: 14px;">
                Didn't request a password reset? Don't worry, your account is safe. Your password won't change unless you complete this process.
              </p>

              <div class="footer">
                <p class="footer-text">
                  © 2026 MindPulse. All rights reserved.<br>
                  This is an automated message, please do not reply.
                </p>
                <p class="footer-text">
                  <strong>Need help?</strong> Contact us at support@mindpulse.com
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your MindPulse password reset code is: ${otp}\n\nValid for 10 minutes.\n\nNever share this code with anyone.`,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - User's email address
 * @param {string} username - User's username
 * @returns {Promise<Object>} - Mail response
 */
const sendPasswordResetConfirmation = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mindpulse.com',
      to: email,
      subject: '✅ MindPulse Password Successfully Reset',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1a1f35 100%);
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(74, 222, 128, 0.3);
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 10px;
              }
              h1 {
                color: #f8fafc;
                margin: 0;
                font-size: 24px;
              }
              .success-box {
                background: rgba(74, 222, 128, 0.15);
                border: 2px solid rgba(74, 222, 128, 0.3);
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .success-icon {
                font-size: 48px;
                margin-bottom: 10px;
              }
              .success-text {
                color: #86efac;
                font-weight: 600;
                margin: 0;
              }
              .content {
                color: #f8fafc;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
              }
              .footer-text {
                color: #64748b;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🧠 MindPulse</div>
                <h1>Password Reset Successful</h1>
              </div>

              <div class="success-box">
                <div class="success-icon">✓</div>
                <p class="success-text">Your password has been successfully reset!</p>
              </div>

              <div class="content">
                <p>Hi ${username},</p>
                <p>Your MindPulse account password has been successfully changed. You can now log in with your new password.</p>
                
                <p><strong>Account Details:</strong></p>
                <ul>
                  <li>Email: ${email}</li>
                  <li>Reset at: ${new Date().toLocaleString()}</li>
                </ul>

                <p>If you did not request this change, please contact our support team immediately.</p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  © 2026 MindPulse. All rights reserved.<br>
                  Your mental health and security matter to us.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Hi ${username},\n\nYour password has been successfully reset. You can now log in with your new password.\n\nIf you did not request this, please contact support.`,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetConfirmation,
  createTestTransporter,
};
