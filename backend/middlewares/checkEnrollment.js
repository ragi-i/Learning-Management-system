const Course = require("../models/Course");

module.exports = async function isEnrolled(req, res, next) {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
    if (!courseId) return res.status(400).json({ message: "Course ID required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.enrolledUsers.includes(userId)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};