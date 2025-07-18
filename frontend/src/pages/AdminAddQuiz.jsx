import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../Style/AdminAddQuiz.css";

const defaultQuestion = {
  text: "",
  options: ["", "", "", ""],
  correctAnswers: [],
  type: "single", // or "multiple"
};

const AdminAddQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({ ...defaultQuestion });
  const [error, setError] = useState("");

  // Handle input changes for current question
  const handleQChange = (e) => {
    setCurrentQ({ ...currentQ, text: e.target.value });
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...currentQ.options];
    newOptions[idx] = value;
    setCurrentQ({ ...currentQ, options: newOptions });
  };

  const handleTypeChange = (e) => {
    setCurrentQ({ ...currentQ, type: e.target.value, correctAnswers: [] });
  };

  const handleCorrectChange = (idx) => {
    if (currentQ.type === "single") {
      setCurrentQ({ ...currentQ, correctAnswers: [idx] });
    } else {
      // multiple
      let arr = [...currentQ.correctAnswers];
      if (arr.includes(idx)) {
        arr = arr.filter((i) => i !== idx);
      } else {
        arr.push(idx);
      }
      setCurrentQ({ ...currentQ, correctAnswers: arr });
    }
  };

  // Add question to list
  const handleAddQuestion = (e) => {
    e.preventDefault();
    setError("");
    if (
      !currentQ.text.trim() ||
      currentQ.options.some((opt) => !opt.trim()) ||
      currentQ.correctAnswers.length === 0
    ) {
      setError("Please fill all fields and select correct answer(s).");
      return;
    }
    setQuestions([...questions, currentQ]);
    setCurrentQ({ ...defaultQuestion });
  };

  // Remove question
  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    setError("");
    if (!quizTitle.trim() || questions.length === 0) {
      setError("Quiz title and at least one question are required.");
      return;
    }
    try {
      await API.post(`/quizzes/${courseId}`, {
        title: quizTitle,
        questions,
      });
      alert("Quiz added successfully!");
      navigate(`/admin/course/${courseId}/details`);
    } catch {
      setError("Failed to add quiz. Please try again.");
    }
  };

  return (
    <div className="admin-add-quiz-bg">
      <div className="admin-add-quiz-card">
        <h2>
          <i className="fa fa-question-circle" style={{ color: "#5bc0be", marginRight: "0.5rem" }}></i>
          Create New Quiz
        </h2>
        <input
          className="quiz-title-input"
          placeholder="Quiz Title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
        />

        <form className="question-form" onSubmit={handleAddQuestion} autoComplete="off">
          <h3>Add Question</h3>
          <label>
            Question Text
            <input
              type="text"
              placeholder="Enter question"
              value={currentQ.text}
              onChange={handleQChange}
              required
            />
          </label>
          <label>
            Question Type
            <select value={currentQ.type} onChange={handleTypeChange}>
              <option value="single">Single Correct</option>
              <option value="multiple">Multiple Correct</option>
            </select>
          </label>
          <div className="options-list">
            {currentQ.options.map((opt, idx) => (
              <div className="option-field" key={idx}>
                {currentQ.type === "single" ? (
                  <input
                    type="radio"
                    name="correct"
                    checked={currentQ.correctAnswers[0] === idx}
                    onChange={() => handleCorrectChange(idx)}
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={currentQ.correctAnswers.includes(idx)}
                    onChange={() => handleCorrectChange(idx)}
                  />
                )}
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          <div className="question-buttons">
            <button type="submit" className="btn-green">
              <i className="fa fa-plus-circle"></i> Add Question
            </button>
          </div>
          {error && <div className="quiz-error">{error}</div>}
        </form>

        {questions.length > 0 && (
          <div className="saved-questions">
            <h3>Questions Added</h3>
            {questions.map((q, idx) => (
              <div className="question-preview" key={idx}>
                <h4>
                  Q{idx + 1}: {q.text}
                  <button
                    className="remove-q-btn"
                    title="Remove"
                    onClick={() => handleRemoveQuestion(idx)}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </h4>
                <ul>
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={q.correctAnswers.includes(i) ? "correct" : ""}
                    >
                      {opt}
                      {q.correctAnswers.includes(i) && (
                        <span className="correct-badge"> ✔</span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="q-type-label">
                  <span>
                    Type:{" "}
                    {q.type === "single" ? "Single Correct" : "Multiple Correct"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="quiz-actions">
          <button className="btn-blue" onClick={handleSubmitQuiz}>
            <i className="fa fa-save"></i> Save Quiz
          </button>
          <button className="btn-gray" onClick={() => navigate(-1)}>
            <i className="fa fa-arrow-left"></i> Cancel
          </button>
        </div>
      </div>
      {/* FontAwesome CDN for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
};

export default AdminAddQuiz;