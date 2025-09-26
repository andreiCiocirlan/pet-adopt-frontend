import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import PetDashboard from "./PetDashboard";
import PetDetails from "./PetDetails";
import MyAdoptions from "./MyAdoptions";
import UserRegistrationForm from "./UserRegistrationForm";
import AdoptionRequestForm from "./AdoptionRequestForm";
import LoginForm from "./LoginForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useLocation } from "react-router-dom";

function Navbar() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-indigo-700 p-4 text-white flex">
      <div className="flex gap-4">
        <Link to="/">Home</Link>
        {userId && <Link to="/my-adoptions">My adoption applications</Link>}
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
  const { userId, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleUserRegistered(id) {
    navigate("/");
  }

  function handleLoginSuccess(token) {
    login(token);
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<PetDashboard />} />
        <Route path="/pets/:petId" element={<PetDetails />} />
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
          element={<AdoptProtectedRoute />}
        />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

function AdoptProtectedRoute() {
  const { userId } = useAuth();
  const { petId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!userId) {
      // Pass current location so we can redirect back after login
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [userId, navigate, location]);

  if (!userId) {
    return null; // or loading spinner
  }

  return <AdoptionRequestForm petId={petId} userId={userId} />;
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
