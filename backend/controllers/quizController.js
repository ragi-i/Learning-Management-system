const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

exports.addQuiz = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create quizzes' });
    }

    const { title, questions } = req.body;
    const courseId = req.params.courseId;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Quiz title and questions required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quiz = await Quiz.create({
      course: courseId,
      title,
      questions: questions.map((q) => ({
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        type: q.type || 'single'
      }))
    });

    course.quizzes.push(quiz._id);
    await course.save();

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.attemptQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Ensure user is enrolled in the course
    const user = await User.findById(userId);
    const enrolled = user.enrolledCourses.some(
      (c) => c.course.toString() === quiz.course._id.toString()
    );
    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q, index) => {
      const selected = answers[index] || [];
      if (Array.isArray(selected)) {
        const isCorrect =
          selected.every((ans) => q.correctAnswers.includes(ans)) &&
          selected.length === q.correctAnswers.length;
        if (isCorrect) score++;
      }
    });

    // Update progress
    let progress = await Progress.findOne({ user: userId, course: quiz.course._id });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: quiz.course._id,
        quizAttempts: [{ quiz: quiz._id, score }],
      });
    } else {
      progress.quizAttempts.push({ quiz: quiz._id, score });
      await progress.save();
    }

    res.json({
      message: 'Quiz submitted',
      score,
      total: quiz.questions.length,
    });
  } catch (err) {
    console.error('Error in attemptQuiz:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

