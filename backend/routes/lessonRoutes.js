const express = require('express');
const router = express.Router();
const { addLesson, markLessonComplete } = require('../controllers/lessonController');
const protect = require('../middlewares/authMiddleware');

router.post('/:courseId', protect, addLesson); // Admin handled inside controller
router.post('/:lessonId/complete', protect, markLessonComplete);

module.exports = router;
