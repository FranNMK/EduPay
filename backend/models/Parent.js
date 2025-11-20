const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
});

module.exports = mongoose.model('Parent', parentSchema);