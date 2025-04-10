const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect('/login');
    }

    const { name, email, password, role, bloodType, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      req.flash('error_msg', 'Email already registered');
      return res.redirect('/login');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      bloodType,
      phone,
      address
    });

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/login');
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/login');
    }

    // Store user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bloodType: user.bloodType
    };

    // Redirect based on role
    if (user.role === 'donor') {
      res.redirect('/donor/dashboard');
    } else {
      res.redirect('/recipient/dashboard');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/login');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
};

// Render login page
exports.showLogin = (req, res) => {
  res.render('login');
};