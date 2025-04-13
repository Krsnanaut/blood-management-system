const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  units: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Inventory;