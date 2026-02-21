const express = require('express');
const Subscription = require('../models/Subscription');
const { sendSubscriptionConfirmationEmail } = require('../utils/emailService');

const router = express.Router();

// @desc    Subscribe email for newsletter/daily reminders
// @route   POST /api/subscribe
// @access  Public
router.post('/', async (req, res) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    const existing = await Subscription.findOne({ where: { email: normalizedEmail } });

    let statusCode = 201;
    let message = 'Subscription successful. Thank you for subscribing!';

    if (existing) {
      statusCode = 200;
      message = 'Email already subscribed. Confirmation email resent.';

      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        message = 'Welcome back! Your subscription has been reactivated.';
      }
    } else {
      await Subscription.create({ email: normalizedEmail });
    }

    const emailResult = await sendSubscriptionConfirmationEmail(normalizedEmail);
    const acceptedRecipients = (emailResult.info?.accepted || []).map((v) => String(v).toLowerCase());
    const rejectedRecipients = (emailResult.info?.rejected || []).map((v) => String(v).toLowerCase());

    const acceptedByProvider = acceptedRecipients.includes(normalizedEmail);

    console.log('[subscribe] confirmation mail delivery', {
      to: normalizedEmail,
      messageId: emailResult.info?.messageId,
      accepted: acceptedRecipients,
      rejected: rejectedRecipients,
      transport: emailResult.isTest ? 'ethereal-test' : 'smtp',
    });

    if (!acceptedByProvider || rejectedRecipients.includes(normalizedEmail)) {
      return res.status(502).json({
        success: false,
        message: 'Subscription saved, but confirmation email delivery failed. Please verify SMTP settings and try again.',
        emailDelivery: {
          delivered: false,
          accepted: acceptedRecipients,
          rejected: rejectedRecipients,
          transport: emailResult.isTest ? 'ethereal-test' : 'smtp',
        },
      });
    }

    const responsePayload = {
      success: true,
      message,
      emailDelivery: {
        delivered: true,
        messageId: emailResult.info?.messageId,
        accepted: acceptedRecipients,
        rejected: rejectedRecipients,
      },
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.emailDelivery.previewUrl = emailResult.previewUrl;
      responsePayload.emailDelivery.transport = emailResult.isTest ? 'ethereal-test' : 'smtp';
    }

    return res.status(statusCode).json(responsePayload);
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      message: 'Unable to process subscription right now. Please try again later.',
    });
  }
});

module.exports = router;
