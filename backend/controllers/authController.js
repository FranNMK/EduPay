const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        // Don't send token on registration, force login
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user (handles both admin and parent)
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // --- Admin & Super Admin Login Flow (Password) ---
    if (user.role === 'admin' || user.role === 'super-admin') {
        // Test account bypass
        if (email === 'frankmk2025@gmail.com' && password === '1234567890') {
            console.log('Test admin login successful.');
            return sendTokenResponse(user, 200, res);
        }

        if (!password) {
            // This is the email validation step. If the email is valid, send success.
            return res.status(200).json({ success: true, message: 'Admin email validated' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        return sendTokenResponse(user, 200, res);
    }

    // --- Parent Login Flow (OTP) ---
    if (user.role === 'parent') {
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        // Set OTP to expire in 10 minutes
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const message = `Your One-Time Password (OTP) for EduPay login is: ${otp}. It is valid for 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your EduPay Login OTP',
                message,
            });
            res.status(200).json({ success: true, message: `OTP sent to ${user.email}` });
        } catch (err) {
            console.error(err);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    }
};

// @desc    Verify OTP and login parent
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
};


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.status(statusCode).json({
        success: true,
        token,
    });
};