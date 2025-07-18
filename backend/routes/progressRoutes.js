const express = require('express');
const router = express.Router();
const { getCourseProgress } = require('../controllers/progressController');
const protect = require('../middlewares/authMiddleware.js');

// Get course progress
router.get('/:courseId', protect, getCourseProgress);


module.exports = router;
