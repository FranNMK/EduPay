const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true }, // Optional email
    password: { type: String },                         // Use bcrypt to hash this
    role: { type: String, default: 'Parent', enum: ['Parent', 'Admin', 'SuperAdmin'] },
    otp: { type: String },                              // Stores temporary OTP hash
    otpExpires: { type: Date }                          // Time limit for OTP
});

module.exports = mongoose.model('User', UserSchema);