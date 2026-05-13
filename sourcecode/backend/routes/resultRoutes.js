const express = require('express');
const router = express.Router();
const { submitExam, getMyResults, getResultById, getResultsByExam } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.post('/', protect, submitExam);
router.get('/me', protect, getMyResults);
router.get('/exam/:examId', protect, adminOnly, getResultsByExam);
router.get('/:resultId', protect, getResultById);

module.exports = router;
