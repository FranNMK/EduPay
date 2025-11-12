import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

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

        // --- OTP Sending Simulation ---
        // In a real application, you would integrate an email/SMS service here.
        // For example, using Nodemailer for email or Twilio for SMS.
        console.log(`
        ================================================
        OTP SENT (SIMULATION)
        ------------------------------------------------
        Recipient: ${identifier}
        OTP Code: ${otp}
        Expires: ${otpExpires.toLocaleTimeString()}
        ================================================
        `);
        // -----------------------------

        res.status(200).json({ success: true, msg: 'OTP has been sent successfully.' });

    } catch (error) {
        console.error('OTP Request Error:', error);
        res.status(500).json({ success: false, msg: 'Server error while requesting OTP.' });
    }
}