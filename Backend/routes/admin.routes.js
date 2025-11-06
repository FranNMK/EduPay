 const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole, checkPermission } = require('../middleware/role.middleware');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Institution = require('../models/Institution');

// Get all payments for institution
router.get('/payments', 
  authMiddleware, 
  checkRole('school_admin', 'super_admin'),
  async (req, res) => {
    try {
      const { institution_id, status, class: className, date_from, date_to } = req.query;

      // Build query
      const query = {};
      
      if (req.user.role === 'school_admin') {
        query.institution_id = req.user.institution_id;
      } else if (institution_id) {
        query.institution_id = institution_id;
      }

      if (status) query.status = status;
      if (className) query['metadata.class'] = className;
      
      if (date_from || date_to) {
        query.created_at = {};
        if (date_from) query.created_at.$gte = new Date(date_from);
        if (date_to) query.created_at.$lte = new Date(date_to);
      }

      const payments = await Payment.find(query)
        .populate('user_id', 'full_name email phone')
        .populate('student_id', 'full_name')
        .sort({ created_at: -1 })
        .limit(1000);

      res.json({ payments });
    } catch (error) {
      console.error('Fetch payments error:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }
);

// Get payment statistics
router.get('/statistics',
  authMiddleware,
  checkRole('school_admin', 'super_admin'),
  async (req, res) => {
    try {
      const institutionId = req.user.role === 'school_admin' 
        ? req.user.institution_id 
        : req.query.institution_id;

      // Total revenue
      const totalRevenue = await Payment.aggregate([
        { $match: { institution_id: institutionId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Payments by status
      const paymentsByStatus = await Payment.aggregate([
        { $match: { institution_id: institutionId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Payments by class
      const paymentsByClass = await Payment.aggregate([
        { $match: { institution_id: institutionId, status: 'completed' } },
        { $group: { _id: '$metadata.class', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      // Recent payments (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentPayments = await Payment.countDocuments({
        institution_id: institutionId,
        status: 'completed',
        created_at: { $gte: sevenDaysAgo }
      });

      res.json({
        totalRevenue: totalRevenue[0]?.total || 0,
        paymentsByStatus,
        paymentsByClass,
        recentPayments
      });
    } catch (error) {
      console.error('Statistics error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
);

// Add student
router.post('/students',
  authMiddleware,
  checkRole('school_admin', 'super_admin'),
  checkPermission('add_students'),
  async (req, res) => {
    try {
      const { email, phone, full_name, class: className, stream } = req.body;

      // Generate temporary password (OTP will be used for login)
      const tempPassword = Math.random().toString(36).slice(-8);

      const student = new User({
        email,
        phone,
        password_hash: tempPassword,
        full_name,
        role: 'student',
        institution_id: req.user.institution_id,
        permissions: ['view_own_payments'],
        metadata: {
          class: className,
          stream
        }
      });

      await student.save();

      res.status(201).json({
        message: 'Student added successfully',
        student: {
          id: student._id,
          email: student.email,
          full_name: student.full_name
        }
      });
    } catch (error) {
      console.error('Add student error:', error);
      res.status(500).json({ error: 'Failed to add student' });
    }
  }
);

// Get all students
router.get('/students',
  authMiddleware,
  checkRole('school_admin', 'super_admin'),
  async (req, res) => {
    try {
      const students = await User.find({
        institution_id: req.user.institution_id,
        role: 'student'
      }).select('-password_hash');

      res.json({ students });
    } catch (error) {
      console.error('Fetch students error:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
);

// Update institution receipt config
router.put('/institution/receipt-config',
  authMiddleware,
  checkRole('school_admin', 'super_admin'),
  checkPermission('edit_receipt_config'),
  async (req, res) => {
    try {
      const { logo_url, header_text, footer_text, breakdown } = req.body;

      const institution = await Institution.findByIdAndUpdate(
        req.user.institution_id,
        {
          $set: {
            'receipt_config.logo_url': logo_url,
            'receipt_config.header_text': header_text,
            'receipt_config.footer_text': footer_text,
            'receipt_config.breakdown': breakdown
          }
        },
        { new: true }
      );

      res.json({
        message: 'Receipt configuration updated',
        receipt_config: institution.receipt_config
      });
    } catch (error) {
      console.error('Update receipt config error:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  }
);

module.exports = router;
