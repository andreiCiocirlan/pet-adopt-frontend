import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import { useAuth } from "./context/AuthContext";

function PetDetails() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    authFetch(`http://localhost:8081/api/pets/${petId}`)
      .then(res => res.json())
      .then(setPet)
      .catch(console.error);
  }, [petId]);

  if (!pet) {
    return <p>Loading...</p>;
  }

  function handleAdoptClick() {
    if (!userId) {
      navigate("/login", { state: { from: location } });
    } else {
      navigate(`/adopt/${pet.id}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <img src={pet.imageUrl} alt={pet.name} className="w-full h-72 object-cover rounded mb-4" />
      <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
      <p><strong>Breed:</strong> {pet.breed}</p>
      <p><strong>Age:</strong> {pet.age} years</p>
      <p><strong>Medical History:</strong> {pet.medicalHistory}</p>
      <button
        onClick={handleAdoptClick}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Adopt Me
      </button>
    </div>
  );
}

export default PetDetails;
