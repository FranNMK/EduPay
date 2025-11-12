import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
    }

    await dbConnect();

    try {
        // 1. Authenticate the user making the request (must be an admin)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, msg: 'Authorization required' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded || !['Admin', 'Super Admin'].includes(decoded.role)) {
            return res.status(403).json({ success: false, msg: 'Forbidden: Admins only' });
        }

        // 2. Get new user data from the request body
        const { name, email, phone, role, studentId } = req.body;

        if (!name || !email || !phone || !role) {
            return res.status(400).json({ success: false, msg: 'Name, email, phone, and role are required.' });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(409).json({ success: false, msg: 'User with this email or phone already exists.' });
        }

        // 4. Create and save the new user
        const newUser = new User({
            name,
            email,
            phone,
            role,
            studentId: role === 'Parent' ? studentId : undefined, // Only save studentId for parents/students
        });

        await newUser.save();

        // Exclude sensitive data from the response
        newUser.otp = undefined;
        newUser.otpExpires = undefined;

        res.status(201).json({ success: true, msg: 'User created successfully', data: newUser });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, msg: 'Server error during registration.' });
    }
}