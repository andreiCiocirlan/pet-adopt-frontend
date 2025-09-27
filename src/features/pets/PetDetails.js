import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import { useAuth } from "../auth/context/AuthContext";
import Carousel from "./components/Carousel";

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

  function handleMeetAndGreetClick() {
    if (!userId) {
      navigate("/login", { state: { from: location } });
    } else {
      navigate(`/book-appointment/${pet.id}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <Carousel images={pet.imageUrls || [pet.imageUrl]} />
      <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
      <p><strong>Characteristics:</strong> {pet.characteristics}</p>
      <p><strong>Breed:</strong> {pet.breed}</p>
      <p><strong>Age:</strong> {pet.age} years</p>
      <p><strong>Health:</strong> {pet.health}</p>
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
