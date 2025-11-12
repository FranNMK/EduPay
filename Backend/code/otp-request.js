import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../../../lib/email';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
    }

    await dbConnect();

    const { identifier, role } = req.body;

    if (!identifier || !role) {
        return res.status(400).json({ success: false, msg: 'Identifier and role are required.' });
    }

    try {
        // Find user by email or phone number
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
            role: { $regex: new RegExp(`^${role}$`, 'i') } // Case-insensitive role match
        });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found with the specified role.' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set OTP expiry to 10 minutes from now
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP and expiry to the user document
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // --- OTP Sending Logic ---
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        if (isEmail) {
            // Send OTP via Email
            await sendOtpEmail(identifier, otp);
        } else {
            // For phone numbers, simulate sending via SMS by logging to console
            // In production, you would integrate an SMS gateway like Twilio here.
            console.log(`
            ================================================
            OTP FOR PHONE (SIMULATION)
            ------------------------------------------------
            Recipient: ${identifier}
            OTP Code: ${otp}
            Expires: ${otpExpires.toLocaleTimeString()}
            ================================================
            `);
        }

        res.status(200).json({ success: true, msg: 'OTP has been sent successfully.' });

    } catch (error) {
        console.error('OTP Request Error:', error);
        if (error.code === 'EAUTH') {
            return res.status(500).json({ success: false, msg: 'Email server authentication failed. Check your credentials.' });
        }
        res.status(500).json({ success: false, msg: 'Server error while requesting OTP.' });
    }
}