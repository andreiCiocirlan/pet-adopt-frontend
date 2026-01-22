import { authFetch } from "../auth/utils/authFetch";
import generateAdoptionCertificate from './utils/generateAdoptionCertificate';
import React, { useState, useEffect } from 'react';

function AdoptionCertificate() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('status', 'AVAILABLE');

        const response = await authFetch(`http://localhost:8081/api/pets?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch pets: ${response.status} ${response.statusText}`);
        }

        const petsData = await response.json();
        setPets(petsData.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markAdoptedAndGenerate = async (pet) => {
    try {
      const adoptResponse = await authFetch(`http://localhost:8081/api/pets/adopt/${pet.id}`, { method: 'PUT' });
      if (!adoptResponse.ok) throw new Error('Failed to mark as adopted');

      generateAdoptionCertificate(pet); // pet.clinic inside pet object

      setPets(prev => prev.filter(p => p.id !== pet.id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading pets...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Release Adoption Certificate</h2>
      {pets.length === 0 ? (
        <p>No available pets found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-center">Image</th>
              <th className="border border-gray-300 p-2 text-center">Pet Name</th>
              <th className="border border-gray-300 p-2 text-center">Breed</th>
              <th className="border border-gray-300 p-2 text-center">Shelter</th>
              <th className="border border-gray-300 p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {pets.map(pet => (
              <tr key={pet.id}>
                <td className="border border-gray-300 p-2 text-center">
                  {pet.imageUrls && pet.imageUrls.length > 0 ? (
                    <img
                      src={pet.imageUrls[0]}
                      alt={`Photo of ${pet.name}`}
                      className="mx-auto h-24 w-24 object-cover rounded"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-center">{pet.name}</td>
                <td className="border border-gray-300 p-2 text-center">{pet.breed}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {pet.clinic?.name || 'N/A'}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => markAdoptedAndGenerate(pet)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Mark Adopted &amp; Export Certificate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdoptionCertificate;
