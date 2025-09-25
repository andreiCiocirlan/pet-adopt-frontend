import React, { useState } from "react";

function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      // You can parse response or just notify success
      onLoginSuccess && onLoginSuccess({ id: 1, email: formData.email }); // set user info accordingly
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Login</h2>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <label className="block mb-2">
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <label className="block mb-4">
        Password:
        <input type="password" name="password" value={formData.password} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>

      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
