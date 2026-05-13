const express = require('express');
const router = express.Router();
const { getMyAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/me', protect, getMyAnalytics);
router.get('/admin', protect, adminOnly, getAdminAnalytics);

module.exports = router;
