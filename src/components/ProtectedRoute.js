import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { userId } = useAuth();
  const location = useLocation();

  if (!userId) {
    // Redirect unauthenticated users to login, preserve original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
