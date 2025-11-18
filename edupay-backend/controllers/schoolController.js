const School = require('../models/School');

exports.createSchool = async (req, res) => {
  try {
    const { schoolName, paybillNumber, bankAccountNumber } = req.body;
    const exists = await School.findOne({ schoolName });
    if (exists) return res.status(400).json({ message: 'School already exists' });

    const school = await School.create({ schoolName, paybillNumber, bankAccountNumber });
    res.status(201).json({ school });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
