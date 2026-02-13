const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// @desc    Get anonymized aggregated stats
// @route   GET /api/admin/stats
// @access  Private (should be Admin only but using protect for now)
router.get('/stats', protect, async (req, res) => {
  try {
    // Mood distribution
    const moodStats = await JournalEntry.findAll({
      attributes: [
        'mood_score',
        [sequelize.fn('count', sequelize.col('id')), 'count'],
      ],
      group: ['mood_score'],
      raw: true,
      order: [['mood_score', 'ASC']],
    });

    // Sentiment distribution
    const sentimentStats = await JournalEntry.findAll({
      attributes: [
        'sentiment_label',
        [sequelize.fn('count', sequelize.col('id')), 'count'],
      ],
      group: ['sentiment_label'],
      raw: true,
    });

    // Average mood
    const avgMoodResult = await JournalEntry.findAll({
      attributes: ['mood_score'],
      raw: true,
    });

    const avgMood =
      avgMoodResult.length > 0
        ? (
            avgMoodResult.reduce((sum, entry) => sum + entry.mood_score, 0) /
            avgMoodResult.length
          ).toFixed(2)
        : 0;

    res.json({
      moodDistribution: moodStats.map((stat) => ({
        _id: stat.mood_score,
        count: stat.count,
      })),
      sentimentDistribution: sentimentStats.map((stat) => ({
        _id: stat.sentiment_label,
        count: stat.count,
      })),
      averageMood: parseFloat(avgMood),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
