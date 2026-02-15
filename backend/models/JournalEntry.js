const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const JournalEntry = sequelize.define(
  'JournalEntry',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mood_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    audio_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sentiment_polarity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sentiment_label: {
      type: DataTypes.STRING, // 'positive', 'neutral', 'negative'
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('tags');
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue('tags', JSON.stringify(val || []));
      },
    },
    transcription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    voice_note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('attachments');
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue('attachments', JSON.stringify(val || []));
      },
    },
  },
  {
    timestamps: true,
    tableName: 'journal_entries',
  }
);

// Define association
JournalEntry.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(JournalEntry, { foreignKey: 'user_id' });

module.exports = JournalEntry;
