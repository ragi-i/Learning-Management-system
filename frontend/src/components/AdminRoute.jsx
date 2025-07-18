import React from 'react';
import { Navigate } from 'react-router-dom';

// Example: get user from context or localStorage
function getUser() {
  // Replace with your actual user retrieval logic
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
}

const AdminRoute = ({ children }) => {
  const user = getUser();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    // Not an admin
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default AdminRoute;
