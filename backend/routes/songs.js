const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Song = require('../models/Song');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure songs upload directory exists
const songsDir = path.join(__dirname, '../uploads/songs');
const createDir = async () => {
  try {
    await fs.mkdir(songsDir, { recursive: true });
    console.log('Songs directory ready:', songsDir);
  } catch (err) {
    console.error('Error creating songs directory:', err);
  }
};
createDir();

// Configure multer for song uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, songsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg', 
    'audio/wav', 
    'audio/ogg', 
    'audio/webm', 
    'audio/mp4', 
    'audio/aac',
    'audio/flac',
    'audio/x-m4a'
  ];
  
  const isAllowed = allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/');
  
  if (isAllowed) {
    cb(null, true);
  } else {
    console.error('File type rejected:', file.mimetype, file.originalname);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter
});

// GET all songs for current user
router.get('/', protect, async (req, res) => {
  try {
    const songs = await Song.find({ userId: String(req.user.id) })
      .select('-filename')
      .sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// POST upload a new song
router.post('/', protect, upload.single('song'), async (req, res) => {
  try {
    console.log('Upload attempt - User:', req.user?.id);
    console.log('File received:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
    const url = `/uploads/songs/${req.file.filename}`;

    console.log('Creating song record:', { title, url, userId: req.user.id });

    const song = new Song({
      userId: String(req.user.id),
      title,
      filename: req.file.filename,
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    await song.save();
    console.log('Song saved successfully:', song._id);
    res.status(201).json(song);
  } catch (err) {
    console.error('Error uploading song:', err);
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        await fs.unlink(path.join(songsDir, req.file.filename));
        console.log('Cleaned up failed upload file');
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    res.status(500).json({ error: 'Failed to upload song: ' + err.message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 50MB' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message || 'An error occurred during upload' });
  }
  next();
});

// DELETE a song
router.delete('/:id', protect, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, userId: String(req.user.id) });
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Delete file
    if (song.filename) {
      try {
        const filePath = path.join(songsDir, song.filename);
        await fs.unlink(filePath);
        console.log('Song file deleted:', song.filename);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await Song.deleteOne({ _id: song._id });
    res.json({ message: 'Song deleted successfully' });
  } catch (err) {
    console.error('Error deleting song:', err);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

module.exports = router;

