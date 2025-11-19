const Payment = require('../models/Payment');
const { submitOrder, getStatus } = require('../utils/pesapalService');

exports.initiatePaymentController = async (req, res) => {
  try {
    const { amount, description, email, phoneNumber, schoolId } = req.body;
    if (!amount || !description) return res.status(400).json({ message: 'Missing amount or description' });

    const order = {
      id: Date.now().toString(),
      amount,
      currency: 'KES',
      description,
      callback_url: process.env.PESAPAL_CALLBACK_URL || 'https://yourdomain.com/api/payments/callback',
      notification_id: '',
      billing_address: {
        email_address: email,
        phone_number: phoneNumber,
        first_name: 'Parent',
        last_name: ''
      }
    };

    const result = await submitOrder(order);
    // PesaPal returns an orderTrackingId or a redirect url depending on API
    // Save a pending payment record
    const payment = await Payment.create({
      payerId: req.user ? req.user._id : null,
      schoolId: schoolId || null,
      amount,
      status: 'Pending',
      orderTrackingId: result.orderTrackingId || result.tracking_id || null
    });

    res.json({ message: 'Payment initiated', result, paymentId: payment._id });
  } catch (err) {
    console.error('initiatePaymentController', err);
    res.status(500).json({ message: err.message });
  }
};

exports.checkStatusController = async (req, res) => {
  try {
    const { orderTrackingId } = req.params;
    const status = await getStatus(orderTrackingId);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Example callback for PesaPal IPN/webhook
exports.callbackHandler = async (req, res) => {
  // PesaPal webhook will send payment updates; store and update Payment accordingly.
  console.log('PesaPal callback received', req.body);
  // Implement verification and update logic based on PesaPal docs
  res.status(200).send('OK');
};
