const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetOTP: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'One-Time Password for password reset'
    },
    resetOTPExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiry time for the reset OTP'
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Session timeout for reset token'
    },
    emergency_alert_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the user has enabled serious emergency notifications'
    }
  },
  {
    timestamps: true,
    // Prevent Sequelize from pluralizing table name
    tableName: 'users',
  }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to check password match
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
