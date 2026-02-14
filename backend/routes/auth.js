const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, sendPasswordResetConfirmation, sendWelcomeEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists by email
    const userExistsByEmail = await User.findOne({ where: { email } });
    if (userExistsByEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check if username is already taken
    const userExistsByUsername = await User.findOne({ where: { username } });
    if (userExistsByUsername) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });

      // Send welcome email asynchronously; don't block registration if it fails
      sendWelcomeEmail(user.email, user.username).catch((err) =>
        console.error('Welcome email error:', err)
      );
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Request password reset - Send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive an OTP shortly.',
        success: true 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      message: 'OTP sent to your email. Valid for 10 minutes.',
      success: true,
      email: email // Send back masked email for verification steps
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if OTP exists and is not expired
    if (!user.resetOTP) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    if (new Date() > user.resetOTPExpiry) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Set token expiry for password reset (15 minutes)
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({ 
      message: 'OTP verified successfully',
      success: true,
      resetToken: jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' })
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, newPassword, resetToken } = req.body;

  try {
    // Validate inputs
    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: 'Email, new password, and reset token are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify token
    try {
      jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if reset token is still valid
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Reset session expired. Please request a new OTP.' });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmation(email, user.username);

    res.status(200).json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Error resetting password' });
  }
});

module.exports = router;
