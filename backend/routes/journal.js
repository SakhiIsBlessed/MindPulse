const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op, sequelize } = require('sequelize');
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeWellnessTrend } = require('../utils/emergencyAutomation');

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.webm';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Configure multer to handle multiple file uploads
const uploadMulti = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
}).fields([
  { name: 'voice_note', maxCount: 1 },
  { name: 'attachments', maxCount: 10 }
]);

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

// @desc    Create a journal entry with attachments
// @route   POST /api/journal
// @access  Private
router.post('/', protect, uploadMulti, async (req, res) => {
  try {
    const { content, mood_score, tags, transcription } = req.body;

    // Require mood_score but allow either text content or an uploaded voice_note
    if (!mood_score) {
      return res.status(400).json({ message: 'Please provide mood score' });
    }
    const hasVoice = req.files && req.files.voice_note && req.files.voice_note.length > 0;
    if (!content && !hasVoice) {
      return res.status(400).json({ message: 'Please provide content or a voice note' });
    }

    let sentiment_polarity = 0;
    let sentiment_label = 'neutral';

    // Call AI Service for sentiment analysis
    try {
      const aiResponse = await axios.post(
        'http://localhost:5001/analyze',
        { text: content },
        { timeout: 3000 }
      );
      sentiment_polarity = aiResponse.data.polarity;
      sentiment_label = aiResponse.data.label;
    } catch (error) {
      console.error('AI Service Error:', error.message);
    }

    // Handle voice note file
    let voiceNoteUrl = null;
    if (req.files && req.files.voice_note && req.files.voice_note.length > 0) {
      const voiceFile = req.files.voice_note[0];
      voiceNoteUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${voiceFile.filename}`;
    }

    // Handle attachment files
    let attachmentUrls = [];
    if (req.files && req.files.attachments && req.files.attachments.length > 0) {
      attachmentUrls = req.files.attachments.map(file => ({
        url: `${req.protocol}://${req.get('host')}/uploads/audio/${file.filename}`,
        name: file.originalname,
        type: file.mimetype
      }));
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = [];
      }
    }

    const entry = await JournalEntry.create({
      user_id: req.user.id,
      content,
      mood_score,
      sentiment_polarity,
      sentiment_label,
      tags: parsedTags,
      transcription: transcription || null,
      voice_note: voiceNoteUrl,
      attachments: attachmentUrls,
    });

    // Perform ethical wellness analysis
    const wellnessAnalysis = await analyzeWellnessTrend(req.user.id);

    res.status(201).json({
      ...entry.toJSON(),
      wellnessAnalysis
    });
  } catch (error) {
    console.error('Post error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Private
router.put('/:id', protect, uploadMulti, async (req, res) => {
  try {
    const entry = await JournalEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Make sure user owns the entry
    if (entry.user_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { content, mood_score, tags, transcription } = req.body;

    if (content) entry.content = content;
    if (mood_score) entry.mood_score = mood_score;

    // Update sentiment if content changed
    if (content) {
      try {
        const aiResponse = await axios.post(
          'http://localhost:5001/analyze',
          { text: content },
          { timeout: 3000 }
        );
        entry.sentiment_polarity = aiResponse.data.polarity;
        entry.sentiment_label = aiResponse.data.label;
      } catch (error) {
        console.error('AI Service Error:', error.message);
      }
    }

    // Handle voice note file
    if (req.files && req.files.voice_note && req.files.voice_note.length > 0) {
      const voiceFile = req.files.voice_note[0];
      entry.voice_note = `${req.protocol}://${req.get('host')}/uploads/audio/${voiceFile.filename}`;
    }

    // Handle attachment files
    if (req.files && req.files.attachments && req.files.attachments.length > 0) {
      const attachmentUrls = req.files.attachments.map(file => ({
        url: `${req.protocol}://${req.get('host')}/uploads/audio/${file.filename}`,
        name: file.originalname,
        type: file.mimetype
      }));
      entry.attachments = attachmentUrls;
    }

    // Parse tags
    if (tags) {
      try {
        entry.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        entry.tags = [];
      }
    }

    if (transcription) entry.transcription = transcription;

    await entry.save();
    res.json(entry);
  } catch (error) {
    console.error('Update error:', error);
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
