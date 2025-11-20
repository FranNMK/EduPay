const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Correct path to models
const Parent = require('../models/Parent');   // Correct path to models
const bcrypt = require('bcryptjs');

// POST /api/students - Add a new student
router.post('/', async (req, res) => {
    const { 
        studentFullName, 
        studentId, 
        studentClass, 
        parentFullName, 
        parentPhone, 
        parentEmail,
        totalDue,
        amountPaid 
    } = req.body;

    // Get institutionId from the auth middleware in server.js
    const institutionId = req.user.institutionId;

    if (!studentFullName || !studentId || !studentClass || !parentFullName || !parentPhone || !parentEmail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // 1. Find or Create Parent
        let parent = await Parent.findOne({ phone: parentPhone });

        if (!parent) {
            // For a new parent, generate a temporary password.
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt); // Use a secure temporary password

            parent = new Parent({
                fullName: parentFullName,
                phone: parentPhone,
                email: parentEmail,
                password: hashedPassword,
            });
            await parent.save();
        }

        // 2. Create and save the new student
        const newStudent = new Student({
            fullName: studentFullName,
            studentId,
            class: studentClass,
            institution: institutionId,
            parent: parent._id,
            totalDue: totalDue || 0,
            amountPaid: amountPaid || 0,
        });

        await newStudent.save();

        res.status(201).json({ message: 'Student added successfully!', student: newStudent });

    } catch (error) {
        console.error('Error adding student:', error);
        if (error.code === 11000) {
             return res.status(409).json({ message: 'A student with this ID or a parent with this phone/email already exists.' });
        }
        res.status(500).json({ message: 'Server error while adding student.' });
    }
});

module.exports = router;