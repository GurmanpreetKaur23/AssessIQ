const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, getUsers);

module.exports = router;
