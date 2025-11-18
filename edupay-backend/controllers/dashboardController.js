const Payment = require('../models/Payment');

exports.getStats = async (req, res) => {
  try {
    const role = req.user.role;
    let stats = {};
    if (role === 'super-admin') {
      stats.totalPayments = await Payment.countDocuments();
      stats.pending = await Payment.countDocuments({ status: 'Pending' });
    } else if (role === 'school-admin') {
      stats.totalPayments = await Payment.countDocuments({ schoolId: req.user.schoolId });
      stats.pending = await Payment.countDocuments({ schoolId: req.user.schoolId, status: 'Pending' });
    } else {
      stats.yourPayments = await Payment.find({ payerId: req.user._id });
    }
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
