import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { userId } = useAuth();
  const location = useLocation();

  if (!userId) {
    // Redirect to login page and save current location for redirect after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
