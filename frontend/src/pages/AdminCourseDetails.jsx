import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import "../Style/AdminCourseDetails.css";
import { AuthContext } from "../authContext";
import { FaPlayCircle, FaQuestionCircle, FaLink, FaChalkboardTeacher } from "react-icons/fa";

const AdminCourseDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState({ lessons: [], quizzes: [] });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedResource, setExpandedResource] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse({
          ...res.data,
          lessons: res.data.lessons || [],
          quizzes: res.data.quizzes || [],
        });
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

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

  if (loading)
    return (
      <div className="loading">
        <span className="loader-spinner" />
      </div>
    );

  return (
    <div className="admin-course-bg">
      <div className="admin-course-wrapper">
        {/* Header */}
        <header className="admin-course-header">
          <div className="admin-header-left">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p>
              <FaChalkboardTeacher style={{ color: "#6366f1", marginRight: 6 }} />
              Instructor: <strong>{course.instructor}</strong>
            </p>
          </div>
          <div className="admin-header-profile">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=6a82fb&color=fff&size=64`}
              alt="Admin"
              className="admin-avatar"
            />
            <span className="admin-name">{user?.name || "Admin"}</span>
          </div>
        </header>

        {/* Lessons */}
        <section>
          <h3 className="section-title">Lessons</h3>
          {course.lessons.length === 0 ? (
            <p className="empty-text">No lessons added yet.</p>
          ) : (
            <div className="lessons-card-grid">
              {course.lessons.map((lesson, idx) => (
                <div className="lesson-card-modern" key={lesson._id}>
                  <div
                    className="lesson-icon"
                    title="Play Video"
                    onClick={() => setSelectedVideo(getEmbedUrl(lesson.videoUrl))}
                  >
                    <FaPlayCircle />
                  </div>
                  <div className="lesson-title">{lesson.title}</div>
                  {lesson.resources && lesson.resources.length > 0 && (
                    <>
                      <a
                        href="#"
                        className="resource-link"
                        onClick={e => {
                          e.preventDefault();
                          setExpandedResource(idx === expandedResource ? null : idx);
                        }}
                      >
                        <FaLink style={{ marginRight: 6 }} /> Resource
                      </a>
                      {expandedResource === idx && (
                        <div className="resource-copy-box" style={{ marginTop: 8 }}>
                          <span style={{ marginRight: 8 }}>{lesson.resources[0]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(lesson.resources[0]);
                              setExpandedResource(null);
                            }}
                            className="copy-btn"
                            type="button"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quizzes */}
        <section>
          <h3 className="section-title">Quizzes</h3>
          {course.quizzes.length === 0 ? (
            <p className="empty-text">No quizzes available yet.</p>
          ) : (
            <div className="quiz-card-grid">
              {course.quizzes.map((quiz) => (
                <div className="quiz-card-modern" key={quiz._id}>
                  <h4>
                    <span className="quiz-icon"><FaQuestionCircle /></span> {quiz.title}
                  </h4>
                  <p>{quiz.questions?.length || 0} questions</p>
                  <details>
                    <summary>View Questions</summary>
                    <ul>
                      {quiz.questions?.map((q, index) => (
                        <li key={index}>
                          <strong>Q{index + 1}:</strong> {q.text}{" "}
                          <span className="q-type">({q.type})</span>
                          <ul>
                            {q.options.map((opt, i) => (
                              <li
                                key={i}
                                className={q.correctAnswers.includes(i) ? "correct" : ""}
                              >
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="video-modal" onClick={() => setSelectedVideo(null)}>
            <div className="video-container" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={selectedVideo}
                title="Lesson Video"
                frameBorder="0"
                allowFullScreen
              ></iframe>
              <button
                className="close-btn"
                onClick={() => setSelectedVideo(null)}
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetails;
