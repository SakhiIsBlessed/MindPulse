const express = require('express');
const router = express.Router();
const axios = require('axios');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user journal entries
// @route   GET /api/journal
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user_id: req.user._id }).sort({
      createdAt: -1,
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

  // Call AI Service for sentiment analysis
  let sentiment_analysis = {
    polarity: 0,
    label: 'neutral',
  };

  try {
    // Assuming python service runs on port 5001
    const aiResponse = await axios.post('http://localhost:5001/analyze', {
      text: content,
    });
    sentiment_analysis = aiResponse.data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback or just log error, proceed without analysis or with default
    // We will proceed with default neutral if AI service fails/not running
  }

  try {
    const entry = await JournalEntry.create({
      user_id: req.user._id,
      content,
      mood_score,
      sentiment_analysis,
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
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.user_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.deleteOne();
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
