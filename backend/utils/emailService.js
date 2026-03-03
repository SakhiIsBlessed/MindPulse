const nodemailer = require('nodemailer');
let cron;
try {
  cron = require('node-cron');
} catch (err) {
  console.warn('⚠️ node-cron not found. Daily email job will be disabled. Run "npm install node-cron" in the backend to enable it.');
}
const Subscription = require('../models/Subscription');

// Transporter cache and metadata
let transporterCache = null;
let transporterIsTest = false;

// Create an Ethereal test transporter (for dev when real SMTP creds are not provided)
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  transporterIsTest = true;
  transporterCache = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return transporterCache;
};

// Get or create transporter. Prefer real SMTP when env vars are present, otherwise fallback to Ethereal.
const getTransporter = async () => {
  if (transporterCache) return { transporter: transporterCache, isTest: transporterIsTest };

  const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : undefined;
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined;

  if (emailUser && emailPass) {
    transporterIsTest = false;
    transporterCache = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 8000, // 8 seconds
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    // Verify transporter (will throw if credentials are invalid or connection hangs)
    try {
      // Use a timeout for the verify call itself if possible, 
      // though connectionTimeout handles the socket level.
      await transporterCache.verify();
      console.log('✅ Email transporter verified (SMTP)');
    } catch (err) {
      console.error('⚠️ SMTP verify failed or timed out, falling back to Ethereal:', err.message);
      transporterCache = null; // Reset cache so we don't keep trying a broken transporter
      return { transporter: await createTestTransporter(), isTest: true };
    }

    return { transporter: transporterCache, isTest: transporterIsTest };
  }

  // No real SMTP creds — create a test account
  return { transporter: await createTestTransporter(), isTest: transporterIsTest };
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

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
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

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

/**
 * Send welcome email on new registration
 * @param {string} email
 * @param {string} username
 */
const sendWelcomeEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@mindpulse.com',
      to: email,
      subject: `Welcome to MindPulse, ${username}! 🧠`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px;">
          <div style="max-width:600px;margin:0 auto;background:rgba(17,24,39,0.9);padding:28px;border-radius:10px;border:1px solid rgba(99,102,241,0.08);">
            <h2 style="color:#a78bfa;margin:0 0 10px;">Welcome to MindPulse, ${username}!</h2>
            <p style="color:#94a3b8;margin:0 0 16px;">Thanks for creating an account. We're glad you're here — MindPulse helps you track moods and journal your way to better wellbeing.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display:inline-block;padding:10px 18px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Get Started</a>
            <p style="color:#64748b;margin-top:18px;font-size:13px;">If you didn't sign up for MindPulse, you can ignore this message.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:18px 0;" />
            <p style="color:#64748b;font-size:12px;margin:0;">© 2026 MindPulse. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Welcome to MindPulse, ${username}! Visit ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login to get started.`,
    };

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};


/**
 * Send newsletter subscription confirmation email
 * @param {string} email
 * @returns {Promise<{info: Object, previewUrl: string | null, isTest: boolean}>}
 */
const sendSubscriptionConfirmationEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"MindPulse" <${process.env.EMAIL_USER || 'noreply@mindpulse.com'}>`,
      to: email,
      subject: '✅ You are subscribed to MindPulse reminders',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background:#0f172a; color:#e2e8f0; padding:24px;"> 
          <div style="max-width:600px;margin:0 auto;background:rgba(17,24,39,0.9);padding:28px;border-radius:10px;border:1px solid rgba(99,102,241,0.08);"> 
            <h2 style="color:#a78bfa;margin:0 0 10px;">You're in! 🎉</h2>
            <p style="color:#94a3b8;margin:0 0 16px;">Thanks for subscribing to MindPulse daily wellbeing reminders.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/journal" style="display:inline-block;padding:10px 18px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Open Journal</a>
            <p style="color:#64748b;margin-top:18px;font-size:13px;">If this wasn't you, you can unsubscribe anytime from the footer link in our emails.</p>
          </div>
        </div>
      `,
      text: `You're subscribed to MindPulse reminders. Visit ${process.env.FRONTEND_URL || 'http://localhost:5173'}/journal.`,
    };

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = isTest ? nodemailer.getTestMessageUrl(info) : null;

    if (previewUrl) {
      console.log('Subscription email preview URL:', previewUrl);
    }

    return { info, previewUrl, isTest };
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error);
    throw new Error('Failed to send subscription confirmation email');
  }
};

/**
 * Send daily reminder/tips email to subscribers
 * @param {string} email
 */
const sendDailyEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"MindPulse" <${process.env.EMAIL_USER || 'noreply@mindpulse.com'}>`,
      to: email,
      subject: '🌟 Daily MindPulse - Your Path to Wellbeing',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 28px;">MindPulse</h1>
            <p style="color: #64748b; margin-top: 5px;">Mindful journaling & insights</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">Daily Wellbeing Tip</h2>
            <p style="color: #475569; line-height: 1.6;">
              "The secret of health for both mind and body is not to mourn for the past, nor to worry about the future, but to live the present moment wisely and earnestly."
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Today, try to spend 5 minutes in complete silence. Just breathe and observe your thoughts without judgment.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/journal" 
                 style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Update My Journal
              </a>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
            <p>You're receiving this because you subscribed to daily reminders from MindPulse.</p>
            <p>© 2026 MindPulse. Built with ❤️ for your wellness.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe" style="color: #6366f1; text-decoration: none;">Unsubscribe</a>
          </div>
        </div>
      `,
      text: `Daily MindPulse Reminder: Stay consistent with your journaling. Visit ${process.env.FRONTEND_URL || 'http://localhost:5173'}/journal to record your thoughts today.`,
    };

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      console.log('Daily email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error(`✗ Error sending daily email to ${email}:`, error);
  }
};

/**
 * Schedule daily email at 9:00 AM
 */
const startDailyEmailJob = () => {
  if (!cron) {
    console.warn('🚀 Daily email scheduler service is disabled (missing node-cron).');
    return;
  }
  // Cron expression for 9:00 AM every day: '0 9 * * *'
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily email job...');
    try {
      const subscribers = await Subscription.findAll({ where: { isActive: true } });
      console.log(`Sending emails to ${subscribers.length} subscribers...`);
      for (const sub of subscribers) {
        await sendDailyEmail(sub.email);
      }
      console.log('✅ Daily email job completed.');
    } catch (error) {
      console.error('❌ Error in daily email job:', error);
    }
  });
  console.log('🚀 Daily email scheduler service started.');
};

/**
 * Send verification email to emergency contact
 * @param {string} email - Contact's email
 * @param {string} contactName - Contact's name
 * @param {string} userName - User's name
 * @param {string} token - Verification token
 */
const sendEmergencyVerificationEmail = async (email, contactName, userName, token) => {
  const verifyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/verify-emergency-email?token=${token}`;
  
  try {
    const mailOptions = {
      from: `"MindPulse Wellness" <${process.env.EMAIL_USER || 'noreply@mindpulse.com'}>`,
      to: email,
      subject: '🚨 Action Required: Verify Emergency Contact for MindPulse',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Verify Your Email</h2>
          <p>Hello ${contactName},</p>
          <p><strong>${userName}</strong> has added you as their emergency contact on <strong>MindPulse</strong>, a student mental wellness platform.</p>
          <p>To ensure we can reach you in case of a serious wellness concern, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #666;">${verifyUrl}</p>
          <hr />
          <p style="font-size: 12px; color: #999;">If you did not expect this email, please ignore it. This is a wellness safety feature.</p>
        </div>
      `,
      text: `Hello ${contactName}, ${userName} has added you as their emergency contact on MindPulse. Please verify your email here: ${verifyUrl}`,
    };

    const { transporter, isTest } = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (isTest) {
      console.log('Emergency verification email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error sending emergency verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetConfirmation,
  createTestTransporter,
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  startDailyEmailJob,
  sendEmergencyVerificationEmail,
};
