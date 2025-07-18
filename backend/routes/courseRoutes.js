const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollInCourse
} = require('../controllers/courseController.js');
const protect = require('../middlewares/authMiddleware.js');

// Public routes
router.get('/', getAllCourses);
router.get('/:id',protect, getCourseById);

// Protected routes
router.post('/', protect, createCourse);
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;
