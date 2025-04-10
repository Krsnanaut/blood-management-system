
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/login');
  };
  
  const isDonor = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'donor') {
      return next();
    }
    req.flash('error_msg', 'Access denied: Donor role required');
    res.redirect('/login');
  };
  
  const isRecipient = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'recipient') {
      return next();
    }
    req.flash('error_msg', 'Access denied: Recipient role required');
    res.redirect('/login');
  };
  
  module.exports = {
    isAuthenticated,
    isDonor,
    isRecipient
  };