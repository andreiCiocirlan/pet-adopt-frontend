import React, { useState } from 'react';

function UserRegistrationForm({ onUserRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const result = await response.json();
      const personId = result.id;
      onUserRegistered(personId);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return <div className="max-w-md mx-auto p-6 bg-green-100 rounded shadow">Registration successful! You can now submit adoption requests.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Registration</h2>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <label className="block mb-2">
        Name:
        <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <label className="block mb-2">
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <label className="block mb-2">
        Phone:
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <label className="block mb-4">
        Address:
        <input type="text" name="address" value={formData.address} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
        Register
      </button>
    </form>
  );
}

export default UserRegistrationForm;
