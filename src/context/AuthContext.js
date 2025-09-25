import React, { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem('authToken', jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);
      setUserId(decoded.id);
      setUserEmail(decoded.sub);
    } catch (e) {
      setUserId(null);
      setUserEmail(null);
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ token, userId, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
