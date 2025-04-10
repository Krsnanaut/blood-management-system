// FILE: routes/donorRoutes.js
const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');

// Middleware to check if user is logged in as donor
const isDonor = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'donor') {
    return next();
  }
  req.flash('error_msg', 'Please log in as a donor');
  res.redirect('/login');
};

// Routes
router.get('/dashboard', isDonor, donorController.dashboard);
router.get('/donate', isDonor, donorController.showDonateForm);
router.post('/donate', isDonor, donorController.createDonation);
router.get('/history', isDonor, donorController.history);

module.exports = router;

