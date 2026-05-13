const express = require('express');
const router = express.Router();
const { predictPerformance } = require('../controllers/mlController');
const { protect } = require('../middleware/authMiddleware');

router.post('/predict-performance', protect, predictPerformance);

module.exports = router;
