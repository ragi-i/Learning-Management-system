import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../authContext";
import "../Style/UserCourseDetails.css";
import { FaCheckCircle, FaPlayCircle, FaLock, FaChalkboardTeacher, FaQuestionCircle } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

const TickIcon = () => (
  <span className="completed-icon" title="Completed">
    <FaCheckCircle size={32} color="#10b981" />
  </span>
);

const UserCourseDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressExpanded, setProgressExpanded] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse(res.data);

        if (user && res.data.isEnrolled) {
          setEnrolled(true);
          const progressRes = await API.get(`/progress/${id}`);
          setProgress(progressRes.data);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      await API.post(`/courses/${id}/enroll`);
      alert("Enrolled successfully!");

      const res = await API.get(`/courses/${id}`);
      setCourse(res.data);
      setEnrolled(true);

      const progressRes = await API.get(`/progress/${id}`);
      setProgress(progressRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await API.post(`/lessons/${lessonId}/complete`);
      const updated = await API.get(`/progress/${id}`);
      setProgress(updated.data);
    } catch (err) {
      alert("Failed to mark lesson complete");
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionIndex] || [];
      if (isMultiple) {
        if (current.includes(optionIndex)) {
          return {
            ...prev,
            [questionIndex]: current.filter((i) => i !== optionIndex),
          };
        } else {
          return { ...prev, [questionIndex]: [...current, optionIndex] };
        }
      } else {
        return { ...prev, [questionIndex]: [optionIndex] };
      }
    });
  };

  const submitQuiz = async () => {
    try {
      const payload = { answers: Object.values(answers) };
      const res = await API.post(`/quizzes/${activeQuiz._id}/attempt`, payload);
      setScore(res.data.score);
      setShowResult(true);

      const updated = await API.get(`/progress/${id}`);
      setProgress(updated.data);
    } catch (err) {
      alert("Error submitting quiz");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return (
    <div className="loading">
      <span className="loader-spinner" />
    </div>
  );
  if (!course) return <p className="error">Course not found</p>;

  return (
    <div className="course-details-wrapper">
      {/* Header */}
      <header className="course-header">
        <div>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p>
            <FaChalkboardTeacher style={{ color: "#6366f1", marginRight: 6 }} />
            Instructor: <strong>{course.instructor}</strong>
          </p>
        </div>
      </header>

      {/* Enroll or Progress */}
      {!enrolled ? (
        <div className="enroll-section" style={{ textAlign: "center", margin: "2rem 0" }}>
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>You are not enrolled in this course.</p>
          <button className="start-quiz-btn" onClick={handleEnroll} style={{ marginTop: 10 }}>
            Enroll Now
          </button>
        </div>
      ) : (
        <div className={`progress-box${progressExpanded ? " expanded" : ""}`}>
          <div
            className="progress-summary"
            onClick={() => setProgressExpanded((exp) => !exp)}
            title={progressExpanded ? "Hide Details" : "Show Details"}
          >
            <h4>Your Progress</h4>
            <span className="expand-icon">
              <FaPlayCircle style={{ transform: progressExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress?.totalProgressPercent || 0}%`,
              }}
            ></div>
          </div>
          <p>
            Lessons Completed: <strong>{progress?.completedLessons || 0}</strong> /{" "}
            <strong>{progress?.totalLessons || 0}</strong>
          </p>
          <p>
            Progress: <strong>{progress?.totalProgressPercent || 0}%</strong>
          </p>
          {progressExpanded && (
            <div className="progress-details">
              {progress?.lastActivityDate && (
                <p>
                  Last Activity:{" "}
                  <strong>
                    {new Date(progress.lastActivityDate).toLocaleDateString()}
                  </strong>
                </p>
              )}
              {progress?.quizAttempts?.length > 0 && (
                <div className="quiz-history">
                  <h5>Your Quiz Attempts:</h5>
                  <ul>
                    {progress.quizAttempts.map((attempt, idx) => (
                      <li key={idx}>
                        Quiz: <strong>{attempt.quiz?.title || "Untitled Quiz"}</strong> | Score:{" "}
                        <strong>
                          {typeof attempt.score === "number"
                            ? `${attempt.score}/${attempt.quiz?.questions?.length ?? "?"}`
                            : "N/A"}
                        </strong>{" "}
                        | Date:{" "}
                        <strong>
                          {attempt.attemptedAt
                            ? new Date(attempt.attemptedAt).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lessons */}
      <section>
        <h3 className="section-title">Lessons</h3>
        <div className="lessons-card-grid">
          {!course.lessons || course.lessons.length === 0 ? (
            <p className="empty-list">No lessons yet.</p>
          ) : (
            course.lessons.map((lesson) => {
              // Robust check for completed lessons (string comparison)
              const completed = progress?.completedLessonsIds?.some(
                (id) => String(id) === String(lesson._id)
              );
              return (
                <div
                  className={`lesson-card-modern ${!enrolled ? "locked" : ""}`}
                  key={lesson._id}
                  style={{
                    opacity: !enrolled ? 0.6 : 1,
                    cursor: !enrolled ? "not-allowed" : "pointer",
                  }}
                >
                  {/* Show tick icon if completed */}
                  {completed && <TickIcon />}
                  <div
                    className="lesson-icon"
                    onClick={() => {
                      if (enrolled && lesson.videoUrl) {
                        setSelectedVideo(getEmbedUrl(lesson.videoUrl));
                      } else if (enrolled) {
                        alert("Video not available");
                      }
                    }}
                    style={{
                      pointerEvents: !enrolled ? "none" : "auto",
                    }}
                  >
                    {enrolled ? <MdOndemandVideo /> : <FaLock />}
                  </div>
                  <div className="lesson-title">{lesson.title}</div>
                  {!enrolled ? (
                    <p className="locked-text">
                      <FaLock style={{ marginRight: 4 }} /> Enroll to access
                    </p>
                  ) : (
                    !completed && (
                      <button
                        className="mark-complete-btn"
                        onClick={() => markLessonComplete(lesson._id)}
                      >
                        <FaCheckCircle style={{ marginRight: 6 }} />
                        Mark Complete
                      </button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Quizzes */}
      <section>
        <h3 className="section-title">Quizzes</h3>
        <div className="quiz-card-grid">
          {!course.quizzes || course.quizzes.length === 0 ? (
            <p className="empty-list">No quizzes yet.</p>
          ) : (
            course.quizzes.map((quiz) => (
              <div
                className={`quiz-card-modern ${!enrolled ? "locked" : ""}`}
                key={quiz._id}
                style={{
                  opacity: !enrolled ? 0.6 : 1,
                  cursor: !enrolled ? "not-allowed" : "pointer",
                }}
              >
                <div className="quiz-icon">
                  <FaQuestionCircle />
                </div>
                <h4>
                  {quiz.title} {!enrolled && <FaLock style={{ marginLeft: 6 }} />}
                </h4>
                <p>{quiz.questions ? quiz.questions.length : 0} questions</p>
                {!enrolled ? (
                  <p className="locked-text">
                    <FaLock style={{ marginRight: 4 }} /> Enroll to start
                  </p>
                ) : (
                  <button
                    className="start-quiz-btn"
                    onClick={() => {
                      setActiveQuiz(quiz);
                      setAnswers({});
                      setShowResult(false);
                    }}
                  >
                    <FaPlayCircle style={{ marginRight: 6 }} />
                    Start Quiz
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={() => setSelectedVideo(null)}>
          <div className="video-container" onClick={(e) => e.stopPropagation()}>
            <iframe src={selectedVideo} title="Lesson Video" frameBorder="0" allowFullScreen></iframe>
            <button className="close-btn" onClick={() => setSelectedVideo(null)}>✖</button>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="quiz-modal" onClick={() => setActiveQuiz(null)}>
          <div className="quiz-container" onClick={(e) => e.stopPropagation()}>
            <h3>{activeQuiz.title}</h3>

            {!showResult ? (
              <>
                {Array.isArray(activeQuiz.questions) &&
                  activeQuiz.questions.map((q, index) => (
                    <div key={index} className="quiz-question">
                      <p>
                        <strong>Q{index + 1}:</strong> {q.text}{" "}
                        {q.type === "multiple" && (
                          <span style={{ color: "blue" }}> (Select all that apply)</span>
                        )}
                      </p>
                      {q.options.map((opt, i) => (
                        <label key={i} className="option-label">
                          <input
                            type={q.type === "multiple" ? "checkbox" : "radio"}
                            name={`question-${index}`}
                            checked={answers[index]?.includes(i)}
                            onChange={() =>
                              handleAnswerChange(index, i, q.type === "multiple")
                            }
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ))}
                <button className="submit-quiz-btn" onClick={submitQuiz}>
                  Submit Quiz
                </button>
              </>
            ) : (
              <div className="quiz-result">
                <h4>Your Score: {score} / {activeQuiz.questions.length}</h4>
                <div className="correct-answers">
                  {activeQuiz.questions.map((q, i) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <p>
                        <strong>Q{i + 1}:</strong> {q.text}
                      </p>
                      <p>
                        Correct Answer(s):{" "}
                        {q.correctAnswers.map((idx) => q.options[idx]).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="start-quiz-btn" onClick={() => setActiveQuiz(null)}>Close</button>
              </div>
            )}

            <button className="close-btn" onClick={() => setActiveQuiz(null)}>✖</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCourseDetails;