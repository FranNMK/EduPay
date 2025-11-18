const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign({
    id: user._id,
    role: user.role,
    schoolId: user.schoolId || null
  }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
