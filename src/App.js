import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import PetDashboard from "./features/pets/PetDashboard";
import PetDetails from "./features/pets/PetDetails";
import MyAppointments from "./features/appointments/MyAppointments";
import AdminAppointments from "./features/appointments/AdminAppointments";
import BookAppointment from "./features/appointments/BookAppointment";
import UserRegistrationForm from "./features/auth/UserRegistrationForm";
import LoginForm from "./features/auth/LoginForm";
import { AuthProvider, useAuth } from "./features/auth/context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";

function Navbar() {
   const { userId, roles, logout } = useAuth();
   const isAdmin = roles.includes("ROLE_ADMIN");
   const isUser = roles.includes("ROLE_USER");
   const navigate = useNavigate();

   function handleLogout() {
     logout();
     navigate("/");
   }

   return (
     <nav className="bg-indigo-700 p-4 text-white flex items-center">
       {/* Left side nav links */}
       <div className="flex gap-4">
         <Link
           to="/"
           aria-label="Home"
           className="text-2xl select-none"
           style={{ userSelect: "none" }}
         >
           ฅ^•ﻌ•^ฅ
         </Link>

         {/* Show My Appointments only for regular users */}
         {userId && isUser && <Link to="/my-appointments">My Appointments</Link>}

         {/* Show Admin Appointments only for admins */}
         {userId && isAdmin && <Link to="/admin-appointments">All Appointments</Link>}
       </div>

       {/* Right side nav links */}
       <div className="ml-auto flex gap-4 items-center">
         {!userId && (
           <>
             <Link to="/register" className="hover:underline">
               Register
             </Link>
             <Link to="/login" className="hover:underline">
               Login
             </Link>
           </>
         )}

         {userId && (
           <button
             onClick={handleLogout}
             className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
           >
             Logout
           </button>
         )}
       </div>
     </nav>
   );
 }

function App() {
  const { login } = useAuth();
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
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-appointments"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />
        <Route
          path="/register"
          element={<UserRegistrationForm onUserRegistered={handleUserRegistered} />}
        />
        <Route
          path="/login"
          element={<LoginForm onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/book-appointment/:petId" element={<BookAppointment />} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="995686742971-0nb6jhrirbu5a2hofrpfgah39h2gv8rt.apps.googleusercontent.com">
        <Router>
          <App />
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
