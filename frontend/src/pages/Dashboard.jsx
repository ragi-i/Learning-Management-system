import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../authContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchEnrolledCourses = async () => {
      try {
        const res = await API.get('/courses');
        const enrolled = res.data.filter((course) =>
          course.enrolledUsers?.includes(user.id)
        );
        setCourses(enrolled);

        // Fetch progress for each enrolled course
        for (let course of enrolled) {
          const progressRes = await API.get(`/progress/${course._id}`);
          setProgressData((prev) => ({
            ...prev,
            [course._id]: progressRes.data
          }));
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err.message);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Dashboard</h2>
      {courses.length === 0 && <p>You haven't enrolled in any courses yet.</p>}
      {courses.map((course) => (
        <div key={course._id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 20 }}>
          <h3>{course.title}</h3>
          <p>Instructor: {course.instructor}</p>
          <p><strong>Progress:</strong> {progressData[course._id]?.totalProgressPercent || 0}%</p>

          <p>
            <Link to={`/course/${course._id}`}>Go to Course</Link>
          </p>

          <div>
            <h4>Completed Lessons: {progressData[course._id]?.completedLessons || 0} / {progressData[course._id]?.totalLessons || 'N/A'}</h4>
            <h4>Quiz Attempts:</h4>
            <ul>
              {progressData[course._id]?.quizAttempts?.map((attempt, idx) => (
                <li key={idx}>
                  Score: {attempt.score} | Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}
                </li>
              )) || <li>No quizzes attempted yet.</li>}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
