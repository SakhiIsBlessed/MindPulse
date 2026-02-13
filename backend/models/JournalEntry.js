const mongoose = require('mongoose');

const journalEntrySchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    mood_score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    sentiment_analysis: {
      polarity: {
        type: Number,
      },
      label: {
        type: String, // 'positive', 'neutral', 'negative'
      },
    },
  },
  {
    timestamps: true,
  }
);

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;
