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
    <div className="flex p-6 gap-8">
      {/* Left sidebar filters */}
      <aside className="w-64 p-4 bg-gray-50 rounded shadow space-y-6 sticky top-20 h-fit">
        <h2 className="text-xl font-semibold mb-4">Filter Pets</h2>

        <div className="flex flex-col space-y-2">
          <label htmlFor="type" className="font-medium">
            Animal Type
          </label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="CAT">Cat</option>
            <option value="DOG">Dog</option>
            <option value="BIRD">Bird</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="breed" className="font-medium">
            Breed
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={filters.breed}
            onChange={handleFilterChange}
            placeholder="Enter breed"
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="age" className="font-medium">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={filters.age}
            onChange={handleFilterChange}
            placeholder="Enter age"
            className="p-2 border rounded"
            min="0"
          />
        </div>
      </aside>

      {/* Right content area: pet cards */}
      <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
      </main>
    </div>
  );
}

export default PetDashboard;
