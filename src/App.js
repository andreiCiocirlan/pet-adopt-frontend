import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import PetList from "./PetList";
import UserRegistrationForm from "./UserRegistrationForm";
import AdoptionRequestForm from "./AdoptionRequestForm";
import LoginForm from "./LoginForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  const [personId, setPersonId] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleUserRegistered(id) {
    setPersonId(id);
    navigate("/adopt/select-pet");
  }

  function handleLoginSuccess(userData) {
    login(userData);
    // Example: assume userData has id
    setPersonId(userData.id);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 p-4 text-white flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PetList />} />
        <Route path="/register" element={<UserRegistrationForm onUserRegistered={handleUserRegistered} />} />
        <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/adopt/:petId"
          element={
            <ProtectedRoute>
              {personId ? <AdoptionRequestFormWrapper personId={personId} /> : <p>Please login first.</p>}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

function AdoptionRequestFormWrapper({ personId }) {
  const { petId } = useParams();
  return <AdoptionRequestForm petId={parseInt(petId, 10)} personId={personId} />;
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}
