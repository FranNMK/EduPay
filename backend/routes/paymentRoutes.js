const express = require('express');
const router = express.Router();
const { initiatePaymentController, checkStatusController, callbackHandler } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, initiatePaymentController);
router.get('/status/:orderTrackingId', protect, checkStatusController);
router.post('/callback', callbackHandler); // public endpoint for PesaPal

module.exports = router;
