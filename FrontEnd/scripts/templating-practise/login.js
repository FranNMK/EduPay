import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
    }

    await dbConnect();

    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
        return res.status(400).json({ success: false, msg: 'Identifier and OTP are required.' });
    }

    try {
        // Find user who has the provided OTP and it has not expired
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
            otp: otp,
            otpExpires: { $gt: Date.now() } // Check if OTP is not expired
        });

        if (!user) {
            return res.status(401).json({ success: false, msg: 'Invalid or expired OTP.' });
        }

        // Clear the OTP fields after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create JWT Payload
        const payload = {
            userId: user._id,
            name: user.name,
            role: user.role
        };

        // Sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d' // Token expires in 7 days
        });

        // Send back token and user role
        res.status(200).json({ success: true, token, role: user.role });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, msg: 'Server error during login.' });
    }
}