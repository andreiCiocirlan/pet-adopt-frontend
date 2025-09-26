import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import Carousel from "./components/Carousel";

function PetDashboard() {
  const [filters, setFilters] = useState({
    type: "CAT",
    breed: "",
    age: "",
  });

  const [pets, setPets] = useState([]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.type) {
      queryParams.append("animalType", filters.type);
    }
    if (filters.breed.trim() !== "") {
      queryParams.append("breed", filters.breed);
    }
    if (filters.age.trim() !== "") {
      queryParams.append("age", filters.age);
    }

    const fetchUrl = `http://localhost:8081/api/pets?${queryParams.toString()}`;

    authFetch(fetchUrl)
      .then((res) => res.json())
      .then(setPets)
      .catch(console.error);
  }, [filters]);

  return (
    <div className="flex p-6 gap-8">
      {/* Sidebar filter with a fun cat emoticon */}
      <aside className="w-64 p-6 bg-yellow-50 rounded-lg shadow space-y-6 sticky top-20 h-fit font-serif">
        <div className="text-4xl text-pink-500 text-center select-none">ฅ^•ﻌ•^ฅ</div>
        <h2 className="text-2xl font-bold text-center text-purple-700">Find Your Purrfect Pet</h2>

        <div className="flex flex-col space-y-4">
          <label htmlFor="type" className="font-semibold text-purple-600">
            🐾 Animal Type
          </label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="CAT">Cat</option>
            <option value="DOG">Dog</option>
            <option value="BIRD">Bird</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="breed" className="font-semibold text-purple-600">
            🐱 Breed
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={filters.breed}
            onChange={handleFilterChange}
            placeholder="e.g. Siamese, Beagle"
            className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="age" className="font-semibold text-purple-600">
            🎂 Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            min="0"
            value={filters.age}
            onChange={handleFilterChange}
            placeholder="Age in years"
            className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </aside>

      {/* Pet listing */}
      <main className="flex-1 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {pets.length === 0 ? (
          <p className="text-center text-gray-500 font-semibold mt-24">
            No pets found matching your criteria! Try changing filters. 🐾
          </p>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300"
            >
              <Carousel images={pet.imageUrls || [pet.imageUrl]} />
              <h2 className="text-xl mt-2 font-bold text-purple-700">{pet.name}</h2>
              <Link
                to={`/pets/${pet.id}`}
                className="mt-3 px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
              >
                Pet Details
              </Link>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default PetDashboard;
