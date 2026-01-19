import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import Carousel from "../pets/components/Carousel";
import { useAuth } from "../auth/context/AuthContext";

function PetDashboard() {
  const [filters, setFilters] = useState({
    type: "",
    breed: "",
    age: "",
    clinicId: ""
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const { roles } = useAuth();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const [loadingDelete, setLoadingDelete] = useState(null);
  const [loadingPets, setLoadingPets] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    authFetch("http://localhost:8081/api/clinics")
      .then(res => res.json())
      .then(setClinics)
      .catch(console.error);
  }, []);

  const fetchPets = useCallback(
    async (pageNo = 0, pageSize = 10) => {
      setLoadingPets(true);
      setError(null);

      const queryParams = new URLSearchParams();

      if (filters.type) queryParams.append("animalType", filters.type);
      if (filters.breed.trim()) queryParams.append("breed", filters.breed);
      if (filters.age) queryParams.append("age", filters.age);
      if (filters.clinicId) queryParams.append("clinicId", filters.clinicId);

      queryParams.append("pageNo", pageNo.toString());
      queryParams.append("pageSize", pageSize.toString());

      const fetchUrl = `http://localhost:8081/api/pets?${queryParams.toString()}`;

      try {
        const response = await authFetch(fetchUrl);
        const data = await response.json();

        setPets(data.content || data);
        setPagination({
          currentPage: data.page || 0,
          pageSize: data.size || 10,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0
        });
      } catch (err) {
        setError(err.message);
        setPets([]);
      } finally {
        setLoadingPets(false);
      }
    },
    [filters] // fetchPets changes when filters change
  );

    useEffect(() => {
      fetchPets(0, pagination.pageSize); // Reset to page 0 when filters change
    }, [filters, fetchPets, pagination.pageSize]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handlePageChange = (pageNo) => {
    fetchPets(pageNo, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize }));
    fetchPets(0, newPageSize); // Reset to page 0
  };

  // Remove pet function
  const handleRemovePet = async (petId) => {
    if (!window.confirm("Are you sure you want to remove this pet?")) return;

    setLoadingDelete(petId);
    setError(null);

    try {
      const response = await authFetch(`http://localhost:8081/api/pets/${petId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove pet");
      }

      setPets((currentPets) => currentPets.filter((pet) => pet.id !== petId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDelete(null);
    }
  };

  // Admin + add pet button handler
  const handleAddPet = () => {
    navigate("/add-pet");
  };

  return (
    <div className="flex p-6 gap-8">
      {/* Sidebar filter with a fun cat emoticon */}
      <aside className="w-64 p-6 bg-yellow-50 rounded-lg shadow space-y-6 sticky top-20 h-fit font-serif">
        <div className="text-4xl text-pink-500 text-center select-none">ฅ^•ﻌ•^ฅ</div>
        <h2 className="text-2xl font-bold text-center text-purple-700">Find Your Purrfect Pet</h2>

        <div className="flex flex-col space-y-4">
          <label htmlFor="clinicId" className="font-semibold text-purple-600">🏥 Clinic</label>
          <select id="clinicId" name="clinicId" value={filters.clinicId} onChange={handleFilterChange} className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Any</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
            ))}
          </select>
          <label htmlFor="type" className="font-semibold text-purple-600">🐾 Type</label>
          <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Any</option>
            <option value="CAT">Cat</option>
            <option value="DOG">Dog</option>
            <option value="BIRD">Bird</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="breed" className="font-semibold text-purple-600">🐱 Breed</label>
          <input type="text" id="breed" name="breed" value={filters.breed} onChange={handleFilterChange} placeholder="e.g. Siamese, Beagle" className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="age" className="font-semibold text-purple-600">🎂 Age</label>
          <input type="number" id="age" name="age" min="0" value={filters.age} onChange={handleFilterChange} placeholder="Age in years" className="p-2 rounded border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </aside>

      {/* Pet listing + Pagination */}
      <main className="flex-1 space-y-6">
        {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

        {loadingPets ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading pets...</div>
          </div>
        ) : pets.length === 0 ? (
          <p className="text-center text-gray-500 font-semibold mt-24">
            No pets found matching your criteria! Try changing filters. 🐾
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
                  <Carousel images={pet.imageUrls || [pet.imageUrl]} />
                  <h2 className="text-xl mt-2 font-bold text-purple-700">{pet.name}</h2>
                  <div className="flex gap-4 mt-3">
                    <Link to={`/pets/${pet.id}`} className="px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition">
                      Pet Details
                    </Link>
                    {isAdmin && pet.status === "ADOPTED" && (
                      <button
                        onClick={() => handleRemovePet(pet.id)}
                        disabled={loadingDelete === pet.id}
                        className="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {loadingDelete === pet.id ? "Removing..." : "Remove Pet"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Pet button */}
              {pets.length > 0 && isAdmin && (
                <button
                  onClick={handleAddPet}
                  className="flex flex-col items-center justify-center border-4 border-green-600 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-300"
                  style={{ minHeight: "250px", padding: "12px", gap: "12px" }}
                >
                  <span className="text-green-600 font-extrabold" style={{ fontSize: "96px", lineHeight: "1" }}>
                    +
                  </span>
                  <span className="text-green-600 font-semibold text-xl select-none">Add Pet</span>
                </button>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-700">
                Showing {pagination.totalElements > 0 ?
                  `${pagination.currentPage * pagination.pageSize + 1}-${Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}` :
                  '0'} of {pagination.totalElements} pets
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={2}>2 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <div className="flex gap-1">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.currentPage === 0}
                    className="px-3 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="px-3 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 bg-gray-200 rounded">
                    Page {pagination.currentPage + 1} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage + 1 >= pagination.totalPages}
                    className="px-3 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages - 1)}
                    disabled={pagination.currentPage + 1 >= pagination.totalPages}
                    className="px-3 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-purple-700 transition"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default PetDashboard;
