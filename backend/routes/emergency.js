const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const EmergencyContact = require('../models/EmergencyContact');
const EmergencyAlert = require('../models/EmergencyAlert');
const nodemailer = require('nodemailer');

/**
 * @desc    Send emergency alert to verified contact
 * @route   POST /api/emergency-alert
 * @access  Private
 */
router.post('/emergency-alert', protect, async (req, res) => {
  try {
    const { pdfData } = req.body; // Base64 PDF string from frontend
    const user = req.user;

    // 1. Check if user enabled emergency alerts
    if (!user.emergency_alert_enabled) {
      return res.status(403).json({ message: 'Emergency alerts are not enabled in your profile.' });
    }

    // 2. Prevent duplicate alerts within a 7-day window
    const lastAlert = await EmergencyAlert.findOne({
      where: {
        user_id: user.id,
        createdAt: {
          [Op.gt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    if (lastAlert) {
      return res.status(429).json({ message: 'An alert was already sent within the last week. Please reach out to someone directly if you need immediate help.' });
    }

    // 3. Find verified emergency contact
    const contact = await EmergencyContact.findOne({ where: { user_id: user.id } });
    if (!contact || !contact.email) {
      return res.status(400).json({ message: 'No emergency contact found. Please update your profile.' });
    }

    if (!contact.email_verified) {
      return res.status(403).json({ message: 'Emergency contact email is not verified. Please ask your contact to check their email.' });
    }

    // 4. Server-side validation of low mood / high risk indicators
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentEntries = await JournalEntry.findAll({
      where: {
        user_id: user.id,
        createdAt: { [Op.gte]: threeDaysAgo }
      },
      order: [['createdAt', 'DESC']]
    });

    let isRiskDetected = false;
    let reason = '';
    let avgMood = 0;

    if (recentEntries.length > 0) {
      avgMood = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length;
      if (avgMood < 2.0) {
        isRiskDetected = true;
        reason = `Sustained low mood (Avg: ${avgMood.toFixed(1)}) over the last 3 days.`;
      }
    }

    // Check for high-risk emotion labels
    const negativeCount = recentEntries.filter(e => e.sentiment_label === 'negative').length;
    if (negativeCount >= 3) {
      isRiskDetected = true;
      reason += (reason ? ' ' : '') + 'Multiple high-risk emotional indicators detected in recent journals.';
    }

    if (!isRiskDetected) {
      // If the user manually triggered but backend doesn't see risk, we still send it if mood is < 3
      if (avgMood < 3.0) {
        isRiskDetected = true;
        reason = 'User requested notification during a period of low-neutral mood.';
      } else {
        return res.status(400).json({ message: 'Alert conditions not met. Our system only escalates when multiple risk factors are identified.' });
      }
    }

    // 5. Send Alert Email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"MindPulse Wellness System" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: 'Urgent Wellness Support Notification – Immediate Attention Recommended',
      text: `Hello,\n\nThis is an important wellness notification regarding ${user.username}.\n\nOur system has identified sustained indicators suggesting that ${user.username} may currently be experiencing significant emotional distress and may require immediate emotional support.\n\nThis message is being sent because the emergency contact feature has been enabled within the account settings.\n\nWe strongly encourage you to initiate a supportive and compassionate conversation with ${user.username} as soon as possible. Early intervention and open communication can make a meaningful difference.\n\nFor your reference, a detailed wellness summary report is attached to this email.\n\nIf you believe the situation may require urgent professional assistance, please consider contacting a qualified mental health professional or local emergency services immediately.\n\nThis notification is intended to promote care, safety, and timely support.\n\nSincerely,\nMindPulse Wellness Monitoring System`,
      attachments: [
        {
          filename: `MindPulse_Wellness_Report_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfData ? pdfData.split('base64,')[1] : '',
          encoding: 'base64'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // 6. Log the alert event
    await EmergencyAlert.create({
      user_id: user.id,
      alert_type: avgMood < 2.0 ? 'mood_dip' : 'high_risk_emotion',
      reason: reason.trim() || 'Threshold criteria met.',
      sent_to: contact.email,
    });

    res.status(200).json({ message: 'Emergency alert sent successfully. Your contact has been notified.' });

  } catch (error) {
    console.error('Emergency route error:', error);
    res.status(500).json({ message: 'Failing to send alert at this time. Please contact help services if this is an emergency.' });
  }
});

/**
 * @desc    Verify emergency contact email
 * @route   GET /api/verify-emergency-email?token=XYZ
 * @access  Public
 */
router.get('/verify-emergency-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('<h1>Invalid Verification Link</h1><p>No token provided.</p>');
    }

    const contact = await EmergencyContact.findOne({ where: { verification_token: token } });

    if (!contact) {
      return res.status(404).send('<h1>Invalid or Expired Token</h1><p>The verification link is invalid or has expired.</p>');
    }

    contact.email_verified = true;
    contact.verification_token = null; // Clear token after verification
    await contact.save();

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #6366f1;">Email Verified successfully! ✅</h1>
        <p>Thank you for verifying your email address as an emergency contact for MindPulse.</p>
        <p>You may now close this window.</p>
      </div>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send('<h1>Server Error</h1><p>Unable to verify email at this time.</p>');
  }
});

module.exports = router;
