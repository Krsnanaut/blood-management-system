const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const BloodUnit = require('../models/BloodUnit');
const Inventory = require('../models/Inventory');
const { Op } = require('sequelize');

// Admin Dashboard
exports.dashboard = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    // Get counts for dashboard cards
    const pendingDonations = await Donation.count({ where: { status: 'pending' } });
    const pendingRequests = await Request.count({ where: { status: 'pending' } });
    const totalDonors = await User.count({ where: { role: 'donor' } });
    const totalRecipients = await User.count({ where: { role: 'recipient' } });

    // Get current inventory
    const inventory = await Inventory.findAll();

    // Get recent activity
    const recentDonations = await Donation.findAll({
      include: [{ model: User, as: 'donor', attributes: ['name', 'bloodType'] }],
      order: [['donationDate', 'DESC']],
      limit: 5
    });

    const recentRequests = await Request.findAll({
      include: [{ model: User, as: 'recipient', attributes: ['name', 'bloodType'] }],
      order: [['requestDate', 'DESC']],
      limit: 5
    });

    // Critical alerts
    const lowInventory = await Inventory.findAll({
      where: { units: { [Op.lt]: 5 } }
    });

    // Expiring blood units (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringUnits = await BloodUnit.count({
      where: {
        expiryDate: { [Op.lt]: sevenDaysFromNow },
        status: 'available'
      }
    });

    res.render('admin/dashboard', {
      user: req.session.user,
      pendingDonations,
      pendingRequests,
      totalDonors,
      totalRecipients,
      inventory,
      recentDonations,
      recentRequests,
      lowInventory,
      expiringUnits
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Manage Users
exports.manageUsers = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/users', {
      user: req.session.user,
      users
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Manage Donations
exports.manageDonations = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const donations = await Donation.findAll({
      include: [{ model: User, as: 'donor', attributes: ['name', 'bloodType'] }],
      order: [['donationDate', 'DESC']]
    });

    res.render('admin/donations', {
      user: req.session.user,
      donations
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Process Donation
exports.processDonation = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const { donationId, status, hbLevel, weight, bloodPressure, notes } = req.body;

    const donation = await Donation.findByPk(donationId);
    if (!donation) {
      req.flash('error_msg', 'Donation not found');
      return res.redirect('/admin/donations');
    }

    // Update donation details
    donation.status = status;
    donation.hbLevel = hbLevel;
    donation.weight = weight;
    donation.bloodPressure = bloodPressure;
    donation.notes = notes || donation.notes;
    donation.processedBy = req.session.user.id;
    donation.processedDate = new Date();
    
    await donation.save();

    // If donation is approved, create blood units and update inventory
    if (status === 'approved') {
      // Get donor's blood type
      const donor = await User.findByPk(donation.donorId);
      if (!donor) {
        req.flash('error_msg', 'Donor not found');
        return res.redirect('/admin/donations');
      }

      // Create blood unit(s)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 42); // Blood typically expires in 42 days

      // Create a blood unit for each unit donated
      const units = Math.round(donation.units);
      for (let i = 0; i < units; i++) {
        await BloodUnit.create({
          bloodType: donor.bloodType,
          status: 'available',
          expiryDate,
          donationId: donation.id
        });
      }

      // Update inventory
      let inventory = await Inventory.findOne({ where: { bloodType: donor.bloodType } });
      if (!inventory) {
        inventory = await Inventory.create({
          bloodType: donor.bloodType,
          units: donation.units
        });
      } else {
        inventory.units += donation.units;
        await inventory.save();
      }
    }

    req.flash('success_msg', `Donation ${status}`);
    res.redirect('/admin/donations');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/donations');
  }
};

// Manage Requests
exports.manageRequests = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const requests = await Request.findAll({
      include: [{ model: User, as: 'recipient', attributes: ['name', 'bloodType'] }],
      order: [['requestDate', 'DESC']]
    });

    // Get current inventory for all blood types
    const inventory = await Inventory.findAll();

    res.render('admin/requests', {
      user: req.session.user,
      requests,
      inventory
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Process Request
exports.processRequest = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const { requestId, status, notes } = req.body;

    const request = await Request.findByPk(requestId);
    if (!request) {
      req.flash('error_msg', 'Request not found');
      return res.redirect('/admin/requests');
    }

    // Update request
    request.status = status;
    request.notes = notes || request.notes;
    await request.save();

    // If fulfilling the request, update inventory
    if (status === 'fulfilled') {
      const inventory = await Inventory.findOne({ where: { bloodType: request.bloodType } });
      if (!inventory || inventory.units < request.units) {
        req.flash('error_msg', 'Not enough blood units available');
        return res.redirect('/admin/requests');
      }

      // Update inventory
      inventory.units -= request.units;
      await inventory.save();

      // Update blood units
      const unitsToAllocate = Math.round(request.units);
      const bloodUnits = await BloodUnit.findAll({
        where: {
          bloodType: request.bloodType,
          status: 'available'
        },
        order: [['expiryDate', 'ASC']], // Use oldest units first
        limit: unitsToAllocate
      });

      for (const unit of bloodUnits) {
        unit.status = 'dispatched';
        await unit.save();
      }
    }

    req.flash('success_msg', `Request ${status}`);
    res.redirect('/admin/requests');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/requests');
  }
};

// Manage Inventory
exports.manageInventory = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    // Get inventory summary
    const inventory = await Inventory.findAll();

    // Get expiring units
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    const expiringUnits = await BloodUnit.findAll({
      where: {
        expiryDate: { [Op.lt]: oneWeekLater },
        status: 'available'
      },
      order: [['expiryDate', 'ASC']]
    });

    // Group units by blood type
    const groupedUnits = {};
    for (const unit of expiringUnits) {
      if (!groupedUnits[unit.bloodType]) {
        groupedUnits[unit.bloodType] = [];
      }
      groupedUnits[unit.bloodType].push(unit);
    }

    res.render('admin/inventory', {
      user: req.session.user,
      inventory,
      expiringUnits: groupedUnits
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};

// Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    const { inventoryId, units } = req.body;

    const inventory = await Inventory.findByPk(inventoryId);
    if (!inventory) {
      req.flash('error_msg', 'Inventory record not found');
      return res.redirect('/admin/inventory');
    }

    inventory.units = units;
    inventory.lastUpdated = new Date();
    await inventory.save();

    req.flash('success_msg', 'Inventory updated successfully');
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/inventory');
  }
};

// Generate Reports
exports.reports = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Please log in as an admin');
      return res.redirect('/login');
    }

    // Get report type from query
    const { type, fromDate, toDate } = req.query;
    let reportData = null;
    let reportTitle = '';

    // Parse dates if provided
    const startDate = fromDate ? new Date(fromDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = toDate ? new Date(toDate) : new Date();

    // Set time to end of day for endDate
    endDate.setHours(23, 59, 59, 999);

    switch (type) {
      case 'donations':
        reportData = await Donation.findAll({
          include: [{ model: User, as: 'donor', attributes: ['name', 'bloodType'] }],
          where: {
            donationDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          order: [['donationDate', 'DESC']]
        });
        reportTitle = 'Donations Report';
        break;
      
      case 'requests':
        reportData = await Request.findAll({
          include: [{ model: User, as: 'recipient', attributes: ['name', 'bloodType'] }],
          where: {
            requestDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          order: [['requestDate', 'DESC']]
        });
        reportTitle = 'Requests Report';
        break;
      
      case 'inventory':
        reportData = await Inventory.findAll();
        reportTitle = 'Current Inventory Report';
        break;
      
      case 'users':
        reportData = await User.findAll({
          attributes: ['id', 'name', 'email', 'role', 'bloodType', 'createdAt'],
          order: [['createdAt', 'DESC']]
        });
        reportTitle = 'Users Report';
        break;
      
      default:
        reportData = [];
        reportTitle = 'Select a Report Type';
    }

    res.render('admin/reports', {
      user: req.session.user,
      reportData,
      reportTitle,
      type: type || '',
      fromDate: fromDate || startDate.toISOString().split('T')[0],
      toDate: toDate || endDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/dashboard');
  }
};