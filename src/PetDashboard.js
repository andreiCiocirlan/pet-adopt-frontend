import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import Carousel from "./components/Carousel";

function PetDashboard() {
  // Filters state with default type 'CAT'
  const [filters, setFilters] = useState({
    type: "CAT",
    breed: "",
    age: "",
  });

  const [pets, setPets] = useState([]);

  // Handle input changes for filters
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch pets whenever filters change
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filters.type) queryParams.append("animalType", filters.type);
    if (filters.breed.trim() !== "") queryParams.append("breed", filters.breed);
    if (filters.age.trim() !== "") queryParams.append("age", filters.age);

    const fetchUrl = `http://localhost:8081/api/pets?${queryParams.toString()}`;

    authFetch(fetchUrl)
      .then((res) => res.json())
      .then(setPets)
      .catch(console.error);
  }, [filters]);

  return (
    <div>
      <div className="p-6 border rounded-lg mb-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Filter Pets</h2>

        <div className="mb-4">
          <label htmlFor="type" className="block font-medium mb-1">
            Animal Type
          </label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="CAT">Cat</option>
            <option value="DOG">Dog</option>
            <option value="BIRD">Bird</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="breed" className="block font-medium mb-1">
            Breed
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={filters.breed}
            onChange={handleFilterChange}
            placeholder="Enter breed"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="age" className="block font-medium mb-1">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={filters.age}
            onChange={handleFilterChange}
            placeholder="Enter age"
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pets.length === 0 ? (
          <p>No pets found for the selected filters.</p>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              <Carousel images={pet.imageUrls || [pet.imageUrl]} />
              <h2 className="text-xl font-semibold">{pet.name}</h2>
              <Link
                to={`/pets/${pet.id}`}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Pet Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PetDashboard;
