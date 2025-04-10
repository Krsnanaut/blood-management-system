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
  donationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Associations
Donation.belongsTo(User, { foreignKey: 'donorId' });

module.exports = Donation;