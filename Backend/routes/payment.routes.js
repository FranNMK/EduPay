  const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Payment = require('../models/Payment');
const Institution = require('../models/Institution');
const { initiateMpesaPayment } = require('../services/mpesa.service');
const { generateReceipt } = require('../services/pdf.service');

// POST /api/payments/initiate
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { student_id, institution_id, amount, payment_method, metadata } = req.body;

    // Get institution for breakdown
    const institution = await Institution.findById(institution_id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Calculate breakdown
    const breakdown = {
      tuition: (amount * institution.receipt_config.breakdown.tuition) / 100,
      facilities: (amount * institution.receipt_config.breakdown.facilities) / 100,
      activities: (amount * institution.receipt_config.breakdown.activities) / 100,
      other: (amount * institution.receipt_config.breakdown.other) / 100
    };

    // Generate transaction ID
    const transaction_id = `EDUPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = new Payment({
      transaction_id,
      user_id: req.user._id,
      student_id,
      institution_id,
      amount,
      breakdown,
      payment_method,
      status: 'pending',
      metadata
    });

    await payment.save();

    // Initiate M-Pesa payment if applicable
    if (payment_method === 'mpesa') {
      const mpesaResult = await initiateMpesaPayment({
        phone: req.user.phone,
        amount,
        accountReference: transaction_id
      });

      payment.payment_details = {
        gateway_ref: mpesaResult.CheckoutRequestID
      };
      await payment.save();
    }

    res.status(201).json({
      message: 'Payment initiated successfully',
      payment: {
        id: payment._id,
        transaction_id: payment.transaction_id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// POST /api/payments/mpesa-callback
router.post('/mpesa-callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    // Find payment by gateway reference
    const payment = await Payment.findOne({
      'payment_details.gateway_ref': stkCallback.CheckoutRequestID
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      payment.status = 'completed';
      payment.completed_at = new Date();
      payment.payment_details.mpesa_code = stkCallback.CallbackMetadata.Item.find(
        item => item.Name === 'MpesaReceiptNumber'
      ).Value;

      await payment.save();

      // Generate receipt
      const receiptPath = await generateReceipt(payment);
      payment.receipt_url = receiptPath;
      await payment.save();
    } else {
      // Payment failed
      payment.status = 'failed';
      await payment.save();
    }

    res.json({ message: 'Callback processed' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

// GET /api/payments/my-payments
router.get('/my-payments', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user._id })
      .populate('institution_id', 'name')
      .sort({ created_at: -1 })
      .limit(50);

    res.json({ payments });
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
