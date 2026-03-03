const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const EmergencyContact = require('../models/EmergencyContact');
const crypto = require('crypto');
const { sendEmergencyVerificationEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            emergency_alert_enabled: req.user.emergency_alert_enabled,
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
        const { username, email, emergency_alert_enabled } = req.body;

        if (username) req.user.username = username;
        if (email) req.user.email = email;
        if (typeof emergency_alert_enabled !== 'undefined') req.user.emergency_alert_enabled = emergency_alert_enabled;

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
    console.log('Emergency Contact Request Body:', req.body);
    try {
        const { name, phone, relation, email } = req.body;


        if (!name || !phone || !relation || !email) {
            return res.status(400).json({ message: 'Name, phone, relation, and email are required' });
        }

        // Check for existing contact with same email or phone for this user
        const existingContact = await EmergencyContact.findOne({
            where: {
                user_id: req.user.id,
                [Op.or]: [{ email }, { phone }]
            }
        });

        if (existingContact) {
            const conflictField = existingContact.email === email ? 'email' : 'phone number';
            return res.status(400).json({ message: `A contact with this ${conflictField} already exists.` });
        }

        const verification_token = crypto.randomBytes(32).toString('hex');

        const contact = await EmergencyContact.create({
            user_id: req.user.id,
            name,
            phone,
            relation,
            email,
            verification_token,
            email_verified: false
        });

        // Send verification email
        await sendEmergencyVerificationEmail(email, name, req.user.username, verification_token);

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
        const { name, phone, relation, email } = req.body;

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
        
        if (email && email !== contact.email) {
            // Check if another contact already uses this email
            const emailExists = await EmergencyContact.findOne({
                where: {
                    user_id: req.user.id,
                    email,
                    id: { [Op.ne]: req.params.id }
                }
            });
            if (emailExists) {
                return res.status(400).json({ message: 'A contact with this email already exists.' });
            }

            contact.email = email;
            contact.email_verified = false;
            contact.verification_token = crypto.randomBytes(32).toString('hex');
            // Send verification email
            await sendEmergencyVerificationEmail(email, contact.name, req.user.username, contact.verification_token);
        }

        if (phone && phone !== contact.phone) {
            // Check if another contact already uses this phone
            const phoneExists = await EmergencyContact.findOne({
                where: {
                    user_id: req.user.id,
                    phone,
                    id: { [Op.ne]: req.params.id }
                }
            });
            if (phoneExists) {
                return res.status(400).json({ message: 'A contact with this phone number already exists.' });
            }
            contact.phone = phone;
        }

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

        // If more than 60% of recent entries are negative, send alert
        if (negativePercentage >= 60) {
            const reason = `Manual trigger requested: Recent analysis shows ${negativePercentage.toFixed(1)}% negative sentiment over last 5 entries.`;
            
            // Generate Wellness Report PDF
            const { generateWellnessReport } = require('../utils/pdfGenerator');
            const pdfBuffer = await generateWellnessReport(recentEntries, req.user);

            // Actually send the email now
            const { sendEmergencyAlertEmail } = require('../utils/emailService');
            await sendEmergencyAlertEmail(
                contact.email, 
                contact.name, 
                req.user.username, 
                reason,
                [
                    {
                        filename: `MindPulse_Wellness_Report_${req.user.username}.pdf`,
                        content: pdfBuffer
                    }
                ]
            );

            res.json({
                success: true,
                message: `✓ Alert sent to ${contact.name}!`,
                sentimentAnalysis: {
                    negativeCount,
                    totalEntries: recentEntries.length,
                    negativePercentage: negativePercentage.toFixed(2),
                    whatsappMessage: `Hi ${contact.name}, I wanted to check in with you. I've been feeling stressed and could really use someone to talk to. Could we catch up soon? - From ${req.user.username}`,
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
