const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    studentId: { type: String, required: true }, // School-specific ID
    class: { type: String, required: true },
    institution: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Institution',
        required: true 
    },
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent', 
        required: true 
    },
    totalDue: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
}, { timestamps: true });

// Create a compound index to ensure a studentId is unique per institution
studentSchema.index({ studentId: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);