// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get token from header (usually sent as 'Bearer TOKEN')
    const token = req.header('Authorization');
    
    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Remove 'Bearer ' prefix
        const tokenValue = token.split(' ')[1];
        
        // 2. Verify token using your secret key
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET); 
        
        // 3. Attach the user object (id, role) to the request
        req.user = decoded.user; 
        
        next(); // Proceed to the route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};