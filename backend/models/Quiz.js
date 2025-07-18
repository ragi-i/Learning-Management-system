const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswers: [{ type: Number, required: true }],
  type: { type: String, enum: ['single', 'multiple'], default: 'single' } 
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  questions: [questionSchema]
});
module.exports = mongoose.model('Quiz', quizSchema);
