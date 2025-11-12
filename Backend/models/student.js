const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    admissionNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    class: { type: String },
    // Link to the parent/guardian who registered them
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    feesDue: { type: Number, default: 0 },
    lastPaymentDate: { type: Date }
});

module.exports = mongoose.model('Student', StudentSchema);