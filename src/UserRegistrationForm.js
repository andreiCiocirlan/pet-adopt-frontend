import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserRegistrationForm({ onRegistered }) {
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Simple client-side validation
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear the specific field error on change
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSuccess(false);
    setServerError(null);

    try {
      const response = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Registration failed");
      }

      setSuccess(true);

      // call parent callback if any
      const data = await response.json();
      onRegistered && onRegistered(data.id);

      // redirect after 2 seconds delay
      setTimeout(() => {
        navigate("/");
      }, 2000);

      onRegistered?.();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">User Registration</h2>

      {serverError && <p className="mb-4 text-red-600">{serverError}</p>}
      {success && <p className="mb-4 text-green-600">Registration successful!</p>}

      <label className="block mb-2">
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`block w-full p-2 border rounded ${errors.name ? "border-red-600" : ""}`}
          required
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </label>

      <label className="block mb-2">
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`block w-full p-2 border rounded ${errors.email ? "border-red-600" : ""}`}
          required
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </label>

      <label className="block mb-2">
        Phone:
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`block w-full p-2 border rounded ${errors.phone ? "border-red-600" : ""}`}
          required
        />
        {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
      </label>

      <label className="block mb-2">
        Address:
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`block w-full p-2 border rounded ${errors.address ? "border-red-600" : ""}`}
          required
        />
        {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
      </label>

      <label className="block mb-4">
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`block w-full p-2 border rounded ${errors.password ? "border-red-600" : ""}`}
          required
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </label>

      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
        Register
      </button>
    </form>
  );
}

export default UserRegistrationForm;
