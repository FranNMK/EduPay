const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', unique: true },
  receiptNo: { type: String, unique: true },
  fileUrl: { type: String },
  details: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
