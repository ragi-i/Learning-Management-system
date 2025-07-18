const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

//  POST /api/auth/login
router.post('/login', login);
router.get('/me', protect, getMe);


module.exports = router;
