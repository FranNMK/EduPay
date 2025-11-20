// EduPay/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Let's use port 3000 to match your frontend config.js
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON bodies

// --- MONGODB CONNECTION ---
// Make sure your MongoDB server is running!
const MONGO_URI = 'mongodb://localhost:27017/edupay'; 

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected to "edupay" database!'))
.catch(err => console.error('MongoDB Connection Error:', err));

// --- API ROUTES ---
// This is a placeholder for authentication middleware.
// In a real app, you'd verify a token to get the admin's institution.
const authMiddleware = (req, res, next) => {
    // For now, we'll hardcode an institution ID.
    // Replace 'YOUR_INSTITUTION_ID' with a real ObjectId from your institutions collection.
    req.user = { institutionId: '60d5f1b3e7b3c6a4b8f0a1b2' }; 
    next();
};

// Make sure your routes folder and files exist in the same directory
app.use('/api/students', authMiddleware, require('./routes/students'));
app.use('/api/payments', authMiddleware, require('./routes/payments'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});