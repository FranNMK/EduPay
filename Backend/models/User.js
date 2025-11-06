 const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['parent', 'student', 'teacher', 'school_admin', 'super_admin'],
    default: 'parent'
  },
  full_name: {
    type: String,
    required: true
  },
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  student_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  permissions: [{
    type: String
  }],
  otp: {
    code: String,
    expires_at: Date,
    verified: Boolean
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
