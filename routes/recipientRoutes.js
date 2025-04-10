
const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');

// Middleware to check if user is logged in as recipient
const isRecipient = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'recipient') {
    return next();
  }
  req.flash('error_msg', 'Please log in as a recipient');
  res.redirect('/login');
};

// Routes
router.get('/dashboard', isRecipient, recipientController.dashboard);
router.get('/request', isRecipient, recipientController.showRequestForm);
router.post('/request', isRecipient, recipientController.createRequest);
router.get('/history', isRecipient, recipientController.history);

module.exports = router;