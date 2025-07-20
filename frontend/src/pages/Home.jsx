import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../authContext";
import "../Style/UserHome.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data);

        if (user) {
          const userRes = await API.get("/auth/me");
          const enrolledData = {};

          for (const ec of userRes.data.enrolledCourses) {
            const progressRes = await API.get(`/progress/${ec.course._id}`);
            enrolledData[ec.course._id] = progressRes.data;
          }

          setEnrolledCourses(enrolledData);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId) => {
    try {
      await API.post(`/courses/${courseId}/enroll`);
      alert("Enrolled successfully!");
      const progressRes = await API.get(`/progress/${courseId}`);
      setEnrolledCourses((prev) => ({
        ...prev,
        [courseId]: progressRes.data,
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) return (
    <div className="loading">
      <span className="loader-spinner" />
    </div>
  );


  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=3a506b&color=fff&size=64`;

  return (
    <div className="user-home-bg">
      {/* Profile Bar */}
      <div className="profile-bar">
        <div className="profile-info">
          <img src={avatarUrl} alt="Profile" className="profile-avatar" />
          <span className="profile-name">
            {user?.name ? `Welcome, ${user.name}` : "Welcome"}
          </span>
        </div>
      </div>

      <div className="user-home-container">
        <h1 className="home-title">Explore Courses</h1>
        <div className="course-grid">
          {courses.map((course) => {
            const progress = enrolledCourses[course._id];
            const isEnrolled = !!progress;
            const isComplete = isEnrolled && progress.totalProgressPercent === 100;

            return (
              <div
                key={course._id}
                className={`course-card ${isEnrolled ? "enrolled" : ""}`}
                onClick={() => navigate(`/user/course/${course._id}`)}
              >
                {/* Thumbnail */}
                <div className="thumbnail-wrapper">
                  <img
                    src={
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={course.title}
                    className="course-thumbnail"
                    
                  />
                  
                  {isEnrolled && (
                    <span
                      className={`status-badge ${
                        isComplete ? "complete" : "in-progress"
                      }`}
                    >
                      {isComplete ? (
                        <>
                          <i className="fa fa-check-circle"></i> Complete
                        </>
                      ) : (
                        <>
                          <i className="fa fa-hourglass-half"></i> In Progress
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Course Info */}
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  <div className="course-meta">
                    <span>
                      <i className="fa fa-user"></i> {course.instructor}
                    </span>
                    <span className="price">
                      <i className="fa fa-tag"></i> ₹{course.price}
                    </span>
                  </div>

                  {/* Progress Section */}
                  {isEnrolled && (
                    <div className="progress-section">
                      <p>
                        {progress.completedLessons} Lessons Completed (
                        {progress.totalProgressPercent}%)
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${progress.totalProgressPercent}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="actions">
                    {isEnrolled ? (
                      <button
                        className="continue-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/course/${course._id}`);
                        }}
                      >
                        <i className="fa fa-arrow-right"></i> Continue
                      </button>
                    ) : (
                      <button
                        className="enroll-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course._id);
                        }}
                      >
                        <i className="fa fa-sign-in-alt"></i> Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* FontAwesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
};

export default Home;
