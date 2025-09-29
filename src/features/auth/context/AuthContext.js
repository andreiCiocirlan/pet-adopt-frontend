import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
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
    } else {
      setUserId(null);
      setUserEmail(null);
      setRoles([]);
    }

    setLoading(false); // Set loading to false once done
  }, [token]);

  const login = (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem('authToken', jwtToken);

    try {
      const decoded = jwtDecode(jwtToken);
      setUserId(decoded.id);
      setUserEmail(decoded.sub);
      setRoles(decoded.roles || []);
    } catch (e) {
      setUserId(null);
      setUserEmail(null);
      setRoles([]);
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setRoles([]);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ token, userId, userEmail, roles, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
