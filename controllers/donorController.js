const Donation = require('../models/Donation');
const User = require('../models/User');

// Show donor dashboard
exports.dashboard = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'donor') {
      req.flash('error_msg', 'Please log in as a donor');
      return res.redirect('/login');
    }

    const donations = await Donation.findAll({
      where: { donorId: req.session.user.id },
      order: [['donationDate', 'DESC']]
    });

    res.render('donor/dashboard', {
      user: req.session.user,
      donations
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Show donation form
exports.showDonateForm = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'donor') {
    req.flash('error_msg', 'Please log in as a donor');
    return res.redirect('/login');
  }

  res.render('donor/donate', { user: req.session.user });
};

// Create a new donation
exports.createDonation = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'donor') {
      req.flash('error_msg', 'Please log in as a donor');
      return res.redirect('/login');
    }

    const { units, notes } = req.body;

    await Donation.create({
      units,
      notes,
      donorId: req.session.user.id
    });

    req.flash('success_msg', 'Thank you for your donation!');
    res.redirect('/donor/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/donor/donate');
  }
};

// Show donation history
exports.history = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'donor') {
      req.flash('error_msg', 'Please log in as a donor');
      return res.redirect('/login');
    }

    const donations = await Donation.findAll({
      where: { donorId: req.session.user.id },
      order: [['donationDate', 'DESC']]
    });

    res.render('donor/history', {
      user: req.session.user,
      donations
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/donor/dashboard');
  }
};
