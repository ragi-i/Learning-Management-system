import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../authContext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return element;
};

export default ProtectedRoute;
