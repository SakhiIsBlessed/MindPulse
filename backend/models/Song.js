const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  originalName: String,
  mimeType: String,
  size: Number,
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-delete file when song is deleted
songSchema.pre('findByIdAndDelete', async function(next) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const song = await this.model.findById(this.getFilter()._id);
    if (song && song.filename) {
      const filepath = path.join(__dirname, '../uploads/songs', song.filename);
      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Song', songSchema);
