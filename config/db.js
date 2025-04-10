const { Sequelize } = require('sequelize');

// Replace these with your actual database credentials
const DB_NAME = 'blood_management';
const DB_USER = 'root';        // Your MySQL username
const DB_PASSWORD = 'entc123'; // Your MySQL password
const DB_HOST = 'localhost';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql'
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    // Sync models with database
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };