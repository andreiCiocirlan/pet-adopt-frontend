import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import PetList from "./PetList";
import UserRegistrationForm from "./UserRegistrationForm";
import AdoptionRequestForm from "./AdoptionRequestForm";

function App() {
  const [personId, setPersonId] = useState(null); // store registered user id
  const navigate = useNavigate();

  // Called after user registers; store personId then navigate to adoption
  function handleUserRegistered(id) {
    setPersonId(id);
    navigate("/adopt/select-pet");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 p-4 text-white flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PetList />} />
        <Route path="/register" element={<UserRegistrationForm onUserRegistered={handleUserRegistered} />} />
        <Route
          path="/adopt/:petId"
          element={
            personId ? <AdoptionRequestFormWrapper personId={personId} /> : <p>Please register first.</p>
          }
        />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

// Wrap AdoptionRequestForm to read petId from route param and pass personId
function AdoptionRequestFormWrapper({ personId }) {
  const { petId } = useParams();
  return <AdoptionRequestForm petId={parseInt(petId, 10)} personId={personId} />;
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
