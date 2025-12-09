// AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decode token info
  const decodeToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setUserEmail(decoded.sub);
      setRoles(decoded.roles || []);
    } catch (e) {
      setUserId(null);
      setUserEmail(null);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      decodeToken(accessToken);
    } else {
      setUserId(null);
      setUserEmail(null);
      setRoles([]);
    }
    setLoading(false);
  }, [accessToken, decodeToken]);

  const login = (data) => {
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    decodeToken(data.accessToken);
  };

  const refreshAccessToken = async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) return false;

    try {
      const response = await fetch("http://localhost:8081/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserId(null);
    setUserEmail(null);
    setRoles([]);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{
      accessToken,
      userId,
      userEmail,
      roles,
      login,
      logout,
      refreshAccessToken,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
