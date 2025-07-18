const express = require('express');
const router = express.Router();
const { addQuiz, getQuizzesByCourse, attemptQuiz } = require('../controllers/quizController');
const protect = require('../middlewares/authMiddleware');

router.post('/:courseId', protect, addQuiz);
router.get('/:courseId', protect, getQuizzesByCourse);
router.post('/:quizId/attempt', protect, attemptQuiz);

module.exports = router;
