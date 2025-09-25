import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import PetList from "./PetList";
import MyAdoptions from "./MyAdoptions";
import UserRegistrationForm from "./UserRegistrationForm";
import AdoptionRequestForm from "./AdoptionRequestForm";
import LoginForm from "./LoginForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Navbar() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-indigo-700 p-4 text-white flex">
      {/* Left side nav links */}
      <div className="flex gap-4">
        <Link to="/">Home</Link>

        {/* Show this only if logged in */}
        {userId && <Link to="/my-adoptions">My Adoptions</Link>}

        {!userId && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>

      {userId && (
        <div className="ml-auto">
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function App() {
  const { userId, login } = useAuth();  // get userId from auth context
  const navigate = useNavigate();

  function handleUserRegistered(id) {
    navigate("/adopt/select-pet");
  }

  function handleLoginSuccess(token) {
    login(token); // expects JWT token, AuthContext will decode and set userId internally
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<PetList />} />
        <Route
            path="/my-adoptions"
            element={
              <ProtectedRoute>
                <MyAdoptions />
              </ProtectedRoute>
            }
          />
        <Route path="/register" element={<UserRegistrationForm onUserRegistered={handleUserRegistered} />} />
        <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/adopt/:petId"
          element={
            <ProtectedRoute>
              {userId ? <AdoptionRequestFormWrapper userId={userId} /> : <p>Please login first.</p>}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

function AdoptionRequestFormWrapper({ userId }) {
  const { petId } = useParams();
  return <AdoptionRequestForm petId={parseInt(petId, 10)} userId={userId} />;
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
