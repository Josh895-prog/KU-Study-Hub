import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ currentUser, allowedRoles = [], children }) {
  // If not authenticated, redirect to home
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  if (allowedRoles.includes(currentUser.role)) {
    return children;
  }

  // If authenticated but not authorized, redirect to profile/home
  return <Navigate to="/profile" replace />;
}
