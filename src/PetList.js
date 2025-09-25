import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function PetList() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/pets")
      .then((res) => res.json())
      .then(setPets)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <div key={pet.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <img src={pet.imageUrl} className="w-48 h-48 rounded object-cover mb-4" alt={pet.name} />
          <h2 className="text-xl font-semibold mb-1">{pet.name}</h2>
          <p className="text-gray-600">{pet.breed} | {pet.type}</p>
          <p className="text-gray-600 mb-4">Age: {pet.age} years</p>
          <Link
            to={`/adopt/${pet.id}`}
            className={`px-4 py-2 rounded text-white ${pet.status === "AVAILABLE" ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
            tabIndex={pet.status === "AVAILABLE" ? 0 : -1}
          >
            {pet.status === "AVAILABLE" ? "Adopt Me" : "Not Available"}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default PetList;
