import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "./utils/authFetch";

function PetDashboard() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    authFetch("http://localhost:8081/api/pets")
      .then(res => res.json())
      .then(setPets)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {pets.map(pet => (
        <div key={pet.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <img src={pet.imageUrl} alt={pet.name} className="w-48 h-48 rounded object-cover mb-4" />
          <h2 className="text-xl font-semibold">{pet.name}</h2>
          <Link
            to={`/pets/${pet.id}`}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Pet Details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default PetDashboard;
