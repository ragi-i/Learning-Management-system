const Progress = require('../models/Progress');
const Course = require('../models/Course');

exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Fetch course to calculate total lessons
    const course = await Course.findById(courseId)
      .populate('lessons')
      .populate('quizzes');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Fetch progress for the user in this course
    const progress = await Progress.findOne({ user: userId, course: courseId })
      .populate('completedLessons')
      .populate('quizAttempts.quiz');

    const totalLessons = course.lessons.length;
    const completedLessons = progress?.completedLessons?.length || 0;

    const totalProgressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Determine last activity date:
    let lastActivityDate = null;
    if (progress) {
      const lessonActivity = progress.updatedAt; // updated when lessons are completed
      const quizActivity =
        progress.quizAttempts.length > 0
          ? progress.quizAttempts[progress.quizAttempts.length - 1].attemptedAt
          : null;

      if (lessonActivity && quizActivity) {
        lastActivityDate =
          lessonActivity > quizActivity ? lessonActivity : quizActivity;
      } else {
        lastActivityDate = lessonActivity || quizActivity;
      }
    }

    res.json({
      totalLessons,
      completedLessons,
      totalProgressPercent,
      lastActivityDate,
      quizAttempts: progress?.quizAttempts || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
