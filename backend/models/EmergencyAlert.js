const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const EmergencyAlert = sequelize.define(
  'EmergencyAlert',
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
    alert_type: {
      type: DataTypes.STRING, // 'mood_dip' or 'high_risk_emotion'
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sent_to: {
      type: DataTypes.STRING, // Email address
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'emergency_alerts',
  }
);

// Define association
EmergencyAlert.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(EmergencyAlert, { foreignKey: 'user_id' });

module.exports = EmergencyAlert;
