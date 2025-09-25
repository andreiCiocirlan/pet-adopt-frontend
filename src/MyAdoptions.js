import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { authFetch } from "./utils/authFetch";

export default function MyAdoptions() {
  const { userId } = useAuth();
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    if (!userId) return;
    authFetch(`http://localhost:8081/api/adoptions/user/${userId}`)
      .then(res => res.json())
      .then(setAdoptions)
      .catch(console.error);
  }, [userId]);

  if (!userId) return <p>Please log in to see your adoptions.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Adoption Applications</h2>
      {adoptions.length === 0 ? (
        <p>You have no adoption applications.</p>
      ) : (
        <ul>
          {adoptions.map((app) => (
            <li key={app.id} className="border p-4 rounded mb-2">
              <div>Pet ID: {app.petId}</div>
              <div>Status: {app.status}</div>
              <div>Requested: {new Date(app.requestDate).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
