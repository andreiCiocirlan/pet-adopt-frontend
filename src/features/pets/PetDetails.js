import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import { useAuth } from "../auth/context/AuthContext";
import Carousel from "./components/Carousel";

function PetDetails() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const { userId, roles } = useAuth(); // Get logged-in user info
  const isAdmin = roles.includes("ROLE_ADMIN");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    authFetch(`http://localhost:8081/api/pets/${petId}`)
      .then(res => res.json())
      .then(setPet)
      .catch(console.error);
  }, [petId]);

  useEffect(() => {
    if (isAdmin) {
      // Fetch clinics only if admin
      authFetch(`http://localhost:8081/api/clinics`)
        .then(res => res.json())
        .then(data => setClinics(data))
        .catch(console.error);
    }
  }, [isAdmin]);

  if (!pet) {
    return <p>Loading...</p>;
  }

  function handleMeetAndGreetClick() {
    if (!userId) {
      navigate("/login", { state: { from: location } });
    } else {
      navigate(`/book-appointment/${pet.id}`);
    }
  }

  function handleAssignClinic() {
    if (!selectedClinicId) {
      alert("Please select a clinic");
      return;
    }
    authFetch(`http://localhost:8081/api/pets/${pet.id}/clinic/${selectedClinicId}`, {
      method: "PATCH",
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to assign clinic");
        return response.json();
      })
      .then(updatedPet => {
        setPet(updatedPet);      // update pet with new clinic info
        setSelectedClinicId(""); // reset selection
        alert("Clinic assigned successfully");
      })
      .catch(err => {
        console.error(err);
        alert("Error assigning clinic");
      });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <Carousel images={pet.imageUrls || [pet.imageUrl]} />
      <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
      <p><strong>Characteristics:</strong> {pet.characteristics}</p>
      <p><strong>Breed:</strong> {pet.breed}</p>
      <p><strong>Age:</strong> {pet.age} years</p>
      <p><strong>Health:</strong> {pet.health}</p>

      {/* Add Clinic info display */}
      {pet.clinic ? (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Clinic Details</h2>
          <p><strong>Name:</strong> {pet.clinic.name}</p>
          <p><strong>Address:</strong> {pet.clinic.address}</p>
          {pet.clinic.phoneNumber && <p><strong>Phone:</strong> {pet.clinic.phoneNumber}</p>}
        </div>
      ) : (
        isAdmin ? (
          <div className="mt-6">
            <label className="block mb-2 font-semibold" htmlFor="clinicSelect">
              Assign Clinic
            </label>
            <select
              id="clinicSelect"
              value={selectedClinicId}
              onChange={e => setSelectedClinicId(e.target.value)}
              className="border p-2 rounded w-full max-w-xs"
            >
              <option value="">-- Select Clinic --</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignClinic}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Assign clinic
            </button>
          </div>
        ) : (
          <p>No clinic information available.</p>
        )
      )}

      {pet.status === "AVAILABLE" ? (
        <button
          onClick={handleMeetAndGreetClick}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Meet and Greet
        </button>
      ) : (
        <p className="mt-4 px-6 py-2 bg-gray-400 text-white rounded cursor-not-allowed">
          Not Available for Adoption
        </p>
      )}
    </div>
  );
}

export default PetDetails;
