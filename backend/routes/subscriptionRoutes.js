const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// @desc    Subscribe to mailing list
// @route   POST /api/subscribe
// @access  Public
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ where: { email } });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ message: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        await existingSubscription.save();
        return res.status(200).json({ message: 'Subscription reactivated successfully' });
      }
    }

    // Create new subscription
    await Subscription.create({ email });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
