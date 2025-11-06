const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  breakdown: {
    tuition: Number,
    facilities: Number,
    activities: Number,
    other: Number
  },
  payment_method: {
    type: String,
    enum: ['mpesa', 'bank', 'card'],
    required: true
  },
  payment_details: {
    mpesa_code: String,
    phone: String,
    gateway_ref: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  purpose: String,
  metadata: {
    class: String,
    stream: String,
    term: String,
    year: Number
  },
  receipt_url: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  completed_at: Date
});

// Create indexes for better query performance
paymentSchema.index({ transaction_id: 1 });
paymentSchema.index({ user_id: 1, created_at: -1 });
paymentSchema.index({ institution_id: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 
