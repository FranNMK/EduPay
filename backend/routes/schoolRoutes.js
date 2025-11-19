const express = require('express');
const router = express.Router();
const { createSchool, getSchools } = require('../controllers/schoolController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, allowRoles('super-admin'), createSchool);
router.get('/', protect, allowRoles('super-admin'), getSchools);

module.exports = router;
