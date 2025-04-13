// models/Donation.js - Updated
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  units: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  donationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  processedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  processedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hbLevel: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Hemoglobin level'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bloodPressure: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Associations
Donation.belongsTo(User, { foreignKey: 'donorId', as: 'donor' });
Donation.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

module.exports = Donation;