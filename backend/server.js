const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Load env vars FIRST before requiring db
dotenv.config();

const { connectDB } = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  try {
    const dirs = [
      path.join(__dirname, 'uploads'),
      path.join(__dirname, 'uploads/songs'),
      path.join(__dirname, 'uploads/audio')
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log('✓ Directory ready:', dir);
      } catch (err) {
        console.error('Error creating directory:', dir, err);
      }
    }
  } catch (err) {
    console.error('Error ensuring upload directories:', err);
  }
};

ensureUploadDirs();

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/songs', require('./routes/songs'));

// Simple health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global handlers to surface otherwise-silent crashes in logs
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
