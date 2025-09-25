import React, { useState } from 'react';
import { authFetch } from "./utils/authFetch";

function AdoptionRequestForm({ petId, userId }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await authFetch('http://localhost:8081/api/adoptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit adoption request');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-100 rounded shadow">
        Your adoption request has been submitted! Thank you.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Adoption Request</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <p className="mb-4">You are requesting to adopt pet with ID: <strong>{petId}</strong></p>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
        Submit Request
      </button>
    </form>
  );
}

export default AdoptionRequestForm;
