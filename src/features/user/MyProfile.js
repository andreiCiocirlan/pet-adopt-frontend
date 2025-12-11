import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { authFetch } from "../auth/utils/authFetch";

export default function MyProfile() {
  const { userId } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load current user profile
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    authFetch(`http://localhost:8081/api/users/me`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }
        return res.json();
      })
      .then((data) => {
        setFormData({
          email: data.email || "",
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      })
      .catch((err) => setError(err.message || "Error loading profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  function validateForm() {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (formData.name.length < 2 || formData.name.length > 100) {
      setError("Name must be between 2 and 100 characters");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone is required");
      return false;
    }
    return true;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on any change
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setSaving(true);

    authFetch(`http://localhost:8081/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || "",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || `Error: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => setSuccess("Profile updated successfully"))
      .catch((err) => setError(err.message || "Error updating profile"))
      .finally(() => setSaving(false));
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-green-700 bg-green-100 border border-green-300 px-3 py-2 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Name - required with validation */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 transition-colors focus:ring-2 focus:ring-indigo-200 ${
              formData.name.length > 0 && (formData.name.length < 2 || formData.name.length > 100)
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-indigo-500"
            }`}
          />
        </div>

        {/* Phone - required */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Address - optional */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
