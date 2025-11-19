const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  schoolName: { type: String, required: true, unique: true },
  paybillNumber: { type: String },
  bankAccountNumber: { type: String },
  status: { type: String, enum: ['Active','Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
