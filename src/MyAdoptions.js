import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { authFetch } from "./utils/authFetch";

export default function MyAdoptions() {
  const { userId } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [petsMap, setPetsMap] = useState({}); // mapping petId -> petName
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    authFetch(`http://localhost:8081/api/adoptions/user/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch adoptions");
        return res.json();
      })
      .then(adoptionsData => {
        setAdoptions(adoptionsData);

        // Extract all unique petIds from adoptions
        const petIds = [...new Set(adoptionsData.map(app => app.petId))];

        // Fetch pets details for all petIds in parallel
        return Promise.all(
          petIds.map(id =>
            authFetch(`http://localhost:8081/api/pets/${id}`)
              .then(res => {
                if (!res.ok) throw new Error("Failed to fetch pet details");
                return res.json();
              })
              .then(petData => ({ id, name: petData.name }))
          )
        );
      })
      .then(petsData => {
        const map = {};
        petsData.forEach(pet => { map[pet.id] = pet.name; });
        setPetsMap(map);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [userId]);

  if (!userId) return <p>Please log in to see your adoptions.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Adoption Applications</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {adoptions.length === 0 ? (
        <p>You have no adoption applications.</p>
      ) : (
        <ul>
          {adoptions.map((app) => (
            <li key={app.id} className="border p-4 rounded mb-2">
              <div>Pet Name: <strong>{petsMap[app.petId] || "Loading..."}</strong></div>
              <div>Status: {app.status}</div>
              <div>Requested: {new Date(app.requestDate).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
