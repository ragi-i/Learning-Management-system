const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');


exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create courses' });
    }

    const { title, description, instructor, price, thumbnail } = req.body;
    if (!title || !description || !instructor || !price || !thumbnail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const course = await Course.create({ title, description, instructor, price, thumbnail });
    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('-lessons -quizzes');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lessons') 
      .populate('quizzes'); 

    if (!course) return res.status(404).json({ message: 'Course not found' });

    let responseCourse = course.toObject();
    let isEnrolled = false;

    // If user is admin, return full data without restrictions
    if (req.user && req.user.role === 'admin') {
      responseCourse.lessons = course.lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        resources: lesson.resources || [],
        locked: false
      }));

      responseCourse.quizzes = course.quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        questions: quiz.questions, 
        locked: false
      }));

      return res.json({ ...responseCourse, isEnrolled: true });
    }

    // Check enrollment for normal users
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        isEnrolled = user.enrolledCourses.some(
          (enroll) => enroll.course.toString() === req.params.id
        );
      }
    }

    if (!isEnrolled) {
      // Lock lessons and quizzes for non-enrolled users
      responseCourse.lessons = responseCourse.lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        locked: true
      }));

      responseCourse.quizzes = responseCourse.quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        totalQuestions: quiz.questions.length,
        locked: true
      }));
    } else {
      // Full data for enrolled users
      responseCourse.lessons = course.lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        resources: lesson.resources || [],
        locked: false
      }));

      responseCourse.quizzes = course.quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        questions: quiz.questions,
        locked: false
      }));
    }

    res.json({ ...responseCourse, isEnrolled });
  } catch (err) {
    console.error('Error in getCourseById:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.enrollInCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const courseId = req.params.id;

    // Validate course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      (enroll) => enroll.course.toString() === courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add course to user's enrolledCourses
    user.enrolledCourses.push({ course: courseId });
    await user.save();

    // Add user to course.enrolledUsers (create field if missing)
    if (!course.enrolledUsers) course.enrolledUsers = [];
    course.enrolledUsers.push(user._id);
    await course.save();

    // Create initial progress
    await Progress.create({
      user: req.user.id,
      course: courseId,
      completedLessons: [],
    });

    res.json({ message: 'Successfully enrolled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }

  };
