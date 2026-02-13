const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get anonymized aggregated stats
// @route   GET /api/admin/stats
// @access  Private (should be Admin only but using protect for now)
router.get('/stats', protect, async (req, res) => {
  try {
    // Aggregate mood scores
    const moodStats = await JournalEntry.aggregate([
      {
        $group: {
          _id: '$mood_score',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by mood score 1-5
      },
    ]);

     // Aggregate sentiment labels
     const sentimentStats = await JournalEntry.aggregate([
      {
        $group: {
          _id: '$sentiment_analysis.label',
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate average mood
    const avgMood = await JournalEntry.aggregate([
        {
            $group: {
                _id: null,
                avgMood: { $avg: '$mood_score' }
            }
        }
    ]);

    res.json({
        moodDistribution: moodStats,
        sentimentDistribution: sentimentStats,
        averageMood: avgMood.length > 0 ? avgMood[0].avgMood : 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
