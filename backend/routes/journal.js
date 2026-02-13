const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op, sequelize } = require('sequelize');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user journal entries
// @route   GET /api/journal
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a journal entry
// @route   POST /api/journal
// @access  Private
router.post('/', protect, async (req, res) => {
  const { content, mood_score } = req.body;

  if (!content || !mood_score) {
    return res.status(400).json({ message: 'Please provide content and mood score' });
  }

  let sentiment_polarity = 0;
  let sentiment_label = 'neutral';

  try {
    // Call AI Service for sentiment analysis
    const aiResponse = await axios.post('http://localhost:5001/analyze', {
      text: content,
    });
    sentiment_polarity = aiResponse.data.polarity;
    sentiment_label = aiResponse.data.label;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback to neutral if AI service fails
  }

  try {
    const entry = await JournalEntry.create({
      user_id: req.user.id,
      content,
      mood_score,
      sentiment_polarity,
      sentiment_label,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.destroy();
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
