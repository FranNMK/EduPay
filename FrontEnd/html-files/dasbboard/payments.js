const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// GET /api/payments - Get all payments for the institution
router.get('/', async (req, res) => {
    try {
        // Get institutionId from the auth middleware
        const institutionId = req.user.institutionId;

        const payments = await Payment.find({ institution: institutionId })
            .populate('student', 'fullName') // Get student's full name
            .sort({ paymentDate: -1 }); // Show most recent first

        res.json(payments);

    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error while fetching payments.' });
    }
});

module.exports = router;