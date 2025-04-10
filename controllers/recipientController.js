// FILE: controllers/recipientController.js
const Request = require('../models/Request');
const User = require('../models/User');

// Show recipient dashboard
exports.dashboard = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'recipient') {
      req.flash('error_msg', 'Please log in as a recipient');
      return res.redirect('/login');
    }

    const requests = await Request.findAll({
      where: { recipientId: req.session.user.id },
      order: [['requestDate', 'DESC']]
    });

    res.render('recipient/dashboard', {
      user: req.session.user,
      requests
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Show request form
exports.showRequestForm = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'recipient') {
    req.flash('error_msg', 'Please log in as a recipient');
    return res.redirect('/login');
  }

  res.render('recipient/request', { user: req.session.user });
};

// Create a new blood request
exports.createRequest = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'recipient') {
      req.flash('error_msg', 'Please log in as a recipient');
      return res.redirect('/login');
    }

    const { bloodType, units, urgency, notes } = req.body;

    await Request.create({
      bloodType,
      units,
      urgency,
      notes,
      recipientId: req.session.user.id
    });

    req.flash('success_msg', 'Blood request submitted successfully');
    res.redirect('/recipient/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/recipient/request');
  }
};

// Show request history
exports.history = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'recipient') {
      req.flash('error_msg', 'Please log in as a recipient');
      return res.redirect('/login');
    }

    const requests = await Request.findAll({
      where: { recipientId: req.session.user.id },
      order: [['requestDate', 'DESC']]
    });

    res.render('recipient/history', {
      user: req.session.user,
      requests
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/recipient/dashboard');
  }
};