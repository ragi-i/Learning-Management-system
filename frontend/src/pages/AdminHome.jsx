import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../authContext";
import "./AdminHome.css";

// const adminProfile = {
//   name: "Admin User",
//   avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6a82fb&color=fff&size=64"
// };

const AdminHome = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user && user.role === "admin") {
      fetchCourses();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return <p style={{ textAlign: "center" }}>Access Denied</p>;
  }

  return (
    <div className="admin-home-bg">
      <div className="admin-home-wrapper">
        <header className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-dashboard-subtitle">
              Manage your courses, lessons, and quizzes efficiently.
            </p>
          </div>
          <div className="admin-profile-box">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=6a82fb&color=fff&size=64`}
              alt="Admin"
              className="admin-avatar"
            />
            <span className="admin-name">{user?.name || "Admin"}</span>
          </div>
        </header>

        <div className="admin-actions-bar">
          <button
            className="add-course-btn"
            onClick={() => navigate("/admin/course")}
          >
            <i className="fa fa-plus"></i> Add New Course
          </button>
        </div>

        <div className="course-grid">
          {courses.length === 0 ? (
            <p className="empty-text">No courses available. Click "Add New Course" to create one.</p>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="course-card">
                {/* Thumbnail with overlay */}
                <div
                  className="thumbnail-wrapper"
                  onClick={() => navigate(`/admin/course/${course._id}/details`)}
                  title="View Course Details"
                >
                  <img
                    src={
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={course.title}
                    className="course-thumbnail"
                  />
                  <div className="thumbnail-overlay">
                    <i className="fa fa-eye"></i>
                  </div>
                </div>

                {/* Course Info */}
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                 <div className="course-meta">
  <span> <i className="fa fa-user"></i> {course.instructor}</span>
  <span className="price">₹{course.price}</span>
</div>

                  <div className="course-card-actions">
                    <button
                      className="manage-lesson-btn"
                      onClick={() => navigate(`/admin/lesson/${course._id}`)}
                    >
                      <i className="fa fa-book"></i> Manage Lessons
                    </button>
                    <button
                      className="add-quiz-btn"
                      onClick={() => navigate(`/admin/quiz/${course._id}`)}
                    >
                      <i className="fa fa-question-circle"></i> Add Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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

export default AdminHome;