const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/questions', protect, adminOnly, getQuestions);
router.post('/questions', protect, adminOnly, createQuestion);

module.exports = router;
