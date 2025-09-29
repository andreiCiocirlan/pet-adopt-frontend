import React from "react";
import { useAuth } from "../features/auth/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export function AdminRoute({ children }) {
  const { userId, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes("ROLE_ADMIN")) {
    return <p className="text-center mt-10 text-red-600 font-semibold">Access denied</p>;
  }

  return children;
}
