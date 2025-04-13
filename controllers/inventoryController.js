// controllers/inventoryController.js
const Inventory = require('../models/Inventory');
const BloodUnit = require('../models/BloodUnit');
const { Op } = require('sequelize');

// Get overall inventory status
exports.getStatus = async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to access this page');
      return res.redirect('/login');
    }

    const inventory = await Inventory.findAll();
    
    // Calculate critical levels (less than 5 units)
    const criticalTypes = inventory.filter(item => item.units < 5).map(item => item.bloodType);

    // Get expired units count (useful for admin alerts)
    const today = new Date();
    const expiredUnits = await BloodUnit.count({
      where: {
        expiryDate: { [Op.lt]: today },
        status: 'available'
      }
    });

    res.render('inventory/status', {
      user: req.session.user,
      inventory,
      criticalTypes,
      expiredUnits: req.session.user.role === 'admin' ? expiredUnits : null
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Check compatibility for a specific blood type
exports.checkCompatibility = async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Please log in to access this page');
      return res.redirect('/login');
    }

    const { bloodType } = req.params;
    
    // Blood type compatibility chart
    const compatibilityChart = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };

    const compatibleTypes = compatibilityChart[bloodType] || [];
    
    // Get inventory for compatible types
    const inventory = await Inventory.findAll({
      where: {
        bloodType: {
          [Op.in]: compatibleTypes
        }
      }
    });

    res.render('inventory/compatibility', {
      user: req.session.user,
      requestedType: bloodType,
      compatibleTypes,
      inventory
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Public blood availability API
exports.getAvailability = async (req, res) => {
  try {
    const inventory = await Inventory.findAll();
    
    // Format data for API response
    const availability = {};
    inventory.forEach(item => {
      availability[item.bloodType] = {
        units: item.units,
        status: item.units < 5 ? 'critical' : item.units < 10 ? 'low' : 'normal',
        lastUpdated: item.lastUpdated
      };
    });

    res.json({ success: true, data: availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Initialize or reset inventory
exports.initializeInventory = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    // Delete all existing inventory records
    await Inventory.destroy({ where: {} });

    // Create default entries for all blood types
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (const type of bloodTypes) {
      await Inventory.create({
        bloodType: type,
        units: 0, // Start with zero units
        lastUpdated: new Date()
      });
    }

    req.flash('success_msg', 'Inventory initialized successfully');
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Manage expired blood units
exports.manageExpiredUnits = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const today = new Date();
    
    // Get all expired blood units
    const expiredUnits = await BloodUnit.findAll({
      where: {
        expiryDate: { [Op.lt]: today },
        status: 'available'
      }
    });

    res.render('admin/expired-units', {
      user: req.session.user,
      expiredUnits
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/inventory');
  }
};

// Remove expired units
exports.removeExpiredUnits = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const today = new Date();
    
    // Get all expired blood units
    const expiredUnits = await BloodUnit.findAll({
      where: {
        expiryDate: { [Op.lt]: today },
        status: 'available'
      }
    });

    // Group by blood type to update inventory
    const expiredByType = {};
    for (const unit of expiredUnits) {
      if (!expiredByType[unit.bloodType]) {
        expiredByType[unit.bloodType] = 0;
      }
      expiredByType[unit.bloodType]++;
      
      // Update unit status
      unit.status = 'expired';
      await unit.save();
    }

    // Update inventory
    for (const [bloodType, count] of Object.entries(expiredByType)) {
      const inventory = await Inventory.findOne({ where: { bloodType } });
      if (inventory) {
        inventory.units = Math.max(0, inventory.units - count);
        inventory.lastUpdated = new Date();
        await inventory.save();
      }
    }

    req.flash('success_msg', `${expiredUnits.length} expired units removed from inventory`);
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/inventory');
  }
};