const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

// Add Lesson (Admin only)
exports.addLesson = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add lessons' });
    }

    const { title, videoUrl, resources } = req.body;
    const { courseId } = req.params;

    const lesson = await Lesson.create({
      title,
      videoUrl,
      resources,
      course: courseId
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { lessons: lesson._id }
    });

    res.status(201).json({ message: 'Lesson added successfully', lesson });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark Lesson Complete (with enrollment check)
exports.markLessonComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lessonId;

    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const courseId = lesson.course;

    // ✅ Check enrollment
    const isEnrolled = await User.exists({
      _id: userId,
      'enrolledCourses.course': courseId
    });

    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must enroll in the course to mark this lesson complete' });
    }

    // ✅ Update Progress
    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLessons: [lessonId]
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        await progress.save();
      }
    }

    res.json({ message: 'Lesson marked as completed', progress });
  } catch (err) {
    console.error('Error in markLessonComplete:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};