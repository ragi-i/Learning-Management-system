import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import LoginSignup from './pages/LoginSignup';
import AdminCreateCourse from './pages/AdminCreateCourse';
import AdminAddLesson from './pages/AdminAddLesson';
import AdminAddQuiz from './pages/AdminAddQuiz';
import AdminHome from './pages/AdminHome';
import AdminCourseDetails from './pages/AdminCourseDetails';
import UserCourseDetails from './pages/UserCourseDetails';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/user/course/:id" element={<UserCourseDetails />} />
        <Route path="*" element={<LoginSignup />} />



<Route
          path="/admin/home"
          element={
            <ProtectedRoute
              element={<AdminHome />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/course"
          element={
            <ProtectedRoute
              element={<AdminCreateCourse />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/lesson/:courseId"
          element={
            <ProtectedRoute
              element={<AdminAddLesson />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/quiz/:courseId"
          element={
            <ProtectedRoute
              element={<AdminAddQuiz />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/admin/course/:id/details"
          element={
            <ProtectedRoute
              element={<AdminCourseDetails />}
              allowedRoles={["admin"]}
            />
          }
        />


      </Routes>
    </Router>
  );
}

export default App;
