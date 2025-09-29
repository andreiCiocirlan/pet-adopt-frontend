import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export function ProtectedRoute({ children }) {
  const { userId, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Or show spinner
    return <p>Loading...</p>;
  }

  if (!userId) {
    // Redirect unauthenticated users to login, preserve original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
