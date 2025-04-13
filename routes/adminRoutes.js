// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const inventoryController = require('../controllers/inventoryController');

// Middleware to check if user is logged in as admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Please log in as an admin');
  res.redirect('/login');
};

// Dashboard
router.get('/dashboard', isAdmin, adminController.dashboard);

// User Management
router.get('/users', isAdmin, adminController.manageUsers);

// Donation Management
router.get('/donations', isAdmin, adminController.manageDonations);
router.post('/donations/process', isAdmin, adminController.processDonation);

// Request Management
router.get('/requests', isAdmin, adminController.manageRequests);
router.post('/requests/process', isAdmin, adminController.processRequest);

// Inventory Management
router.get('/inventory', isAdmin, adminController.manageInventory);
router.post('/inventory/update', isAdmin, adminController.updateInventory);
router.post('/inventory/initialize', isAdmin, inventoryController.initializeInventory);
router.get('/expired-units', isAdmin, inventoryController.manageExpiredUnits);
router.post('/expired-units/remove', isAdmin, inventoryController.removeExpiredUnits);

// Reports
router.get('/reports', isAdmin, adminController.reports);

module.exports = router;