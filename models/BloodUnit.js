const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Donation = require('./Donation');

const BloodUnit = sequelize.define('BloodUnit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'dispatched', 'expired'),
    defaultValue: 'available'
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  collectedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Associations
BloodUnit.belongsTo(Donation, { foreignKey: 'donationId' });

module.exports = BloodUnit;