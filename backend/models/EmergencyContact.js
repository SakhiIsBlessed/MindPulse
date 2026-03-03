const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const EmergencyContact = sequelize.define(
    'EmergencyContact',
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        relation: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Relationship to the user (Parent, Sibling, Friend, Partner, Counselor, Other)',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: 'emergency_contacts',
    }
);

// Define association
EmergencyContact.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(EmergencyContact, { foreignKey: 'user_id' });

module.exports = EmergencyContact;
