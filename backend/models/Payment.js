const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  txnId: { type: String, unique: true, sparse: true },
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success','Pending','Failed','Verified'], default: 'Pending' },
  orderTrackingId: { type: String } // PesaPal's tracking id
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
