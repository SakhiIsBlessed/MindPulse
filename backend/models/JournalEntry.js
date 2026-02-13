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
      allowNull: false,
    },
    mood_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    sentiment_polarity: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sentiment_label: {
      type: DataTypes.STRING, // 'positive', 'neutral', 'negative'
      allowNull: true,
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
