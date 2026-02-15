const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   POST /api/user/update
// @access  Private
router.post('/update', protect, async (req, res) => {
    try {
        const { username, email } = req.body;

        if (username) req.user.username = username;
        if (email) req.user.email = email;

        await req.user.save();

        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Change password
// @route   POST /api/user/change-password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
    try {
        const { oldPass, newPass } = req.body;

        if (!oldPass || !newPass) {
            return res.status(400).json({ message: 'Both passwords required' });
        }

        if (!(await req.user.matchPassword(oldPass))) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        req.user.password = newPass;
        await req.user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user account
// @route   POST /api/user/delete
// @access  Private
router.post('/delete', protect, async (req, res) => {
    try {
        await req.user.destroy();
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
