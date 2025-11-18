const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { generateAndSendOtp, verifyOtp } = require('../utils/otpService');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber, schoolId } = req.body;
    if (!fullName || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role, phoneNumber, schoolId });
    // If parent, require OTP verification
    if (role === 'parent' && phoneNumber) {
      await generateAndSendOtp(phoneNumber);
      return res.status(201).json({ message: 'Registered. OTP sent to phone for verification', userId: user._id });
    }
    res.status(201).json({ message: 'Registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // If parent and not verified, send OTP and require verification
    if (user.role === 'parent' && !user.isVerified && user.phoneNumber) {
      await generateAndSendOtp(user.phoneNumber);
      return res.status(200).json({ message: 'OTP sent', requireOtp: true, userId: user._id });
    }

    const token = generateToken(user);
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code, userId } = req.body;
    if (!phoneNumber || !code) return res.status(400).json({ message: 'Missing phoneNumber or code' });
    const ok = verifyOtp(phoneNumber, code);
    if (!ok) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // mark user verified if userId provided
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.isVerified = true;
        await user.save();
      }
    }

    // If user exists with phoneNumber, generate token as well
    const user = await User.findOne({ phoneNumber });
    const token = user ? generateToken(user) : null;

    res.json({ message: 'OTP verified', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
