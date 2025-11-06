 const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'college', 'university'],
    required: true
  },
  registration_number: {
    type: String,
    required: true,
    unique: true
  },
  contact: {
    email: String,
    phone: String,
    address: String
  },
  payment_details: {
    mpesa: {
      paybill: String,
      account_number: String
    },
    bank: {
      name: String,
      account_number: String,
      branch: String
    }
  },
  receipt_config: {
    logo_url: String,
    header_text: String,
    footer_text: String,
    breakdown: {
      tuition: { type: Number, default: 70 },
      facilities: { type: Number, default: 15 },
      activities: { type: Number, default: 10 },
      other: { type: Number, default: 5 }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    started_at: Date,
    expires_at: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    },
    amount: Number
  },
  structure: {
    classes: [String],
    streams: [String],
    departments: [String]
  },
  admin_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Institution', institutionSchema);
