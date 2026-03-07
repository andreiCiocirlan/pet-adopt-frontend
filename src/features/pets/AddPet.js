import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import { Scissors, Syringe, Cpu } from "lucide-react";

const animalTypes = ["CAT", "DOG", "BIRD"];

export default function AddPet() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    name: "",
    age: "",
    type: "",
    breed: "",
    health: "",
    characteristics: "",
    clinicId: "",
    imageUrls: ["", "", ""],
    isNeutered: false,
    isVaccinated: false,
    hasMicrochip: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch("http://localhost:8081/api/clinics")
      .then(res => res.json())
      .then(setClinics)
      .catch(() => setError("Failed to load clinics"));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleImageUrlChange(index, value) {
    const newUrls = [...form.imageUrls];
    newUrls[index] = value;
    setForm(prev => ({ ...prev, imageUrls: newUrls }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const requestBody = {
      name: form.name,
      age: +form.age, // convert to number
      type: form.type,
      breed: form.breed,
      characteristics: form.characteristics,
      clinicId: form.clinicId,
      imageUrls: form.imageUrls.filter(url => url.trim() !== ""),
      isNeutered: form.isNeutered,
      isVaccinated: form.isVaccinated,
      hasMicrochip: form.hasMicrochip,
    };

    try {
      const response = await authFetch("http://localhost:8081/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add pet");
      }

      navigate("/"); // redirect to dashboard after success
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h1 className="text-3xl mb-4 font-bold text-center">Add New Pet</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            min="0"
            value={form.age}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Select an animal type</option>
            {animalTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="breed">Breed</label>
          <input
            id="breed"
            name="breed"
            type="text"
            value={form.breed}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="characteristics">Characteristics</label>
          <textarea
            id="characteristics"
            name="characteristics"
            value={form.characteristics}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Medical & Care Status Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Medical & Care Status</h3>

          <div className="space-y-3">
            {/* Neutered/Spayed */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Scissors className="w-5 h-5 text-blue-600" />
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  id="isNeutered"
                  name="isNeutered"
                  checked={form.isNeutered}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="font-medium text-gray-700">Neutered/Spayed</span>
              </label>
              <span className={`font-semibold text-sm ${form.isNeutered ? 'text-green-600' : 'text-red-600'}`}>
                {form.isNeutered ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Vaccinated */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Syringe className="w-5 h-5 text-red-600" />
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  id="isVaccinated"
                  name="isVaccinated"
                  checked={form.isVaccinated}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="font-medium text-gray-700">Vaccinated</span>
              </label>
              <span className={`font-semibold text-sm ${form.isVaccinated ? 'text-green-600' : 'text-red-600'}`}>
                {form.isVaccinated ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Microchipped */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-600" />
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  id="hasMicrochip"
                  name="hasMicrochip"
                  checked={form.hasMicrochip}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
                <span className="font-medium text-gray-700">Microchipped</span>
              </label>
              <span className={`font-semibold text-sm ${form.hasMicrochip ? 'text-green-600' : 'text-red-600'}`}>
                {form.hasMicrochip ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="clinicId">Clinic</label>
          <select
            id="clinicId"
            name="clinicId"
            value={form.clinicId}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Select a Clinic</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Image URLs</label>
          {[0, 1, 2].map(index => (
            <input
              key={index}
              type="url"
              placeholder={`Image URL #${index + 1}`}
              value={form.imageUrls[index]}
              onChange={e => handleImageUrlChange(index, e.target.value)}
              className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-3 rounded hover:bg-purple-800"
        >
          Create Pet
        </button>
      </form>
    </div>
  );
}
