const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const EmergencyContact = require('../models/EmergencyContact');

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

// ===== EMERGENCY CONTACTS ROUTES =====

// @desc    Get all emergency contacts for user
// @route   GET /api/user/emergency-contacts
// @access  Private
router.get('/emergency-contacts', protect, async (req, res) => {
    try {
        const contacts = await EmergencyContact.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add new emergency contact
// @route   POST /api/user/emergency-contacts
// @access  Private
router.post('/emergency-contacts', protect, async (req, res) => {
    try {
        const { name, phone, relation } = req.body;

        if (!name || !phone || !relation) {
            return res.status(400).json({ message: 'Name, phone, and relation are required' });
        }

        const contact = await EmergencyContact.create({
            user_id: req.user.id,
            name,
            phone,
            relation
        });

        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update emergency contact
// @route   PUT /api/user/emergency-contacts/:id
// @access  Private
router.put('/emergency-contacts/:id', protect, async (req, res) => {
    try {
        const { name, phone, relation } = req.body;

        const contact = await EmergencyContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (contact.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this contact' });
        }

        if (name) contact.name = name;
        if (phone) contact.phone = phone;
        if (relation) contact.relation = relation;

        await contact.save();

        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete emergency contact
// @route   DELETE /api/user/emergency-contacts/:id
// @access  Private
router.delete('/emergency-contacts/:id', protect, async (req, res) => {
    try {
        const contact = await EmergencyContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (contact.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this contact' });
        }

        await contact.destroy();

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Check journal sentiment and send alert to emergency contact
// @route   POST /api/user/alert-emergency-contact
// @access  Private
router.post('/alert-emergency-contact', protect, async (req, res) => {
    try {
        const { contactId } = req.body;

        if (!contactId) {
            return res.status(400).json({ message: 'Contact ID is required' });
        }

        // Get the emergency contact
        const contact = await EmergencyContact.findByPk(contactId);

        if (!contact || contact.user_id !== req.user.id) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Get user's last 5 journal entries for sentiment analysis
        const JournalEntry = require('../models/JournalEntry');
        const recentEntries = await JournalEntry.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        if (recentEntries.length === 0) {
            return res.status(400).json({ message: 'No journal entries found to analyze' });
        }

        // Analyze sentiment from entries
        const negativeKeywords = ['sad', 'depressed', 'stressed', 'stress', 'anxious', 'anxiety', 'worried', 'worry', 'upset', 'angry', 'frustrated', 'lonely', 'alone', 'hopeless', 'helpless', 'tired', 'exhausted'];
        
        let negativeCount = 0;
        recentEntries.forEach(entry => {
            const content = (entry.content || '').toLowerCase();
            const label = (entry.sentiment_label || '').toLowerCase();
            
            // Check sentiment label or content for negative keywords
            if (label === 'negative' || negativeKeywords.some(kw => content.includes(kw))) {
                negativeCount++;
            }
        });

        const negativePercentage = (negativeCount / recentEntries.length) * 100;

        // If more than 60% of recent entries are negative, send WhatsApp alert
        if (negativePercentage >= 60) {
            // Send WhatsApp message via API call (to be handled by frontend or external service)
            const message = `Hi ${contact.name}, I wanted to check in with you. I've been feeling stressed and could really use someone to talk to. Could we catch up soon? I'm also seeking support at the MindPulse Support page. - From ${req.user.username}`;

            res.json({
                success: true,
                message: 'Alert prepared to send to emergency contact',
                sentimentAnalysis: {
                    negativeCount,
                    totalEntries: recentEntries.length,
                    negativePercentage: negativePercentage.toFixed(2),
                    whatsappMessage: message,
                    contactPhone: contact.phone,
                    contactName: contact.name
                }
            });
        } else {
            res.json({
                success: false,
                message: `Recent entries show ${negativePercentage.toFixed(2)}% negative sentiment. Alert threshold is 60%.`,
                sentimentAnalysis: {
                    negativeCount,
                    totalEntries: recentEntries.length,
                    negativePercentage: negativePercentage.toFixed(2)
                }
            });
        }
    } catch (error) {
        console.error('Error checking sentiment:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
