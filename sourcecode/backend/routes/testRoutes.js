const express = require('express');
const router = express.Router();
const { getTests, startTest, answerQuestion } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTests);
router.post('/start', protect, startTest);
router.post('/answer', protect, answerQuestion);

module.exports = router;
