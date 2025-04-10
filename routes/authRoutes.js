// FILE: routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// Login route
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Register route (embedded in login page)
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('bloodType', 'Blood type is required').not().isEmpty(),
  check('phone', 'Phone number is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty()
], authController.register);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;

