import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { authFetch } from "../auth/utils/authFetch";

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // Call reverse geocoding with Nominatim
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
      )
        .then((res) => res.json())
        .then((data) => setAddress(data.display_name || ""))
        .catch(() => setAddress(""));
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function ClinicCreationForm() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !phoneNumber || !position) {
      setError("Please provide a name, phone number, and select a location on the map.");
      return;
    }
    // Submit clinic data to backend
    const clinicData = {
      name,
      phoneNumber,
      address,
      latitude: position.lat,
      longitude: position.lng,
    };

    authFetch("http://localhost:8081/api/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clinicData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create clinic");
        }
        alert("Clinic created successfully");
        navigate("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-8">
      <h2 className="text-2xl mb-4 font-bold text-center">Add Clinic</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="block font-semibold mb-1" htmlFor="name">Clinic Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="e.g. +1234567890"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            value={address}
            readOnly
            rows={3}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100 resize-none"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Pick Location on Map</label>
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
          </MapContainer>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-700 text-white p-3 rounded hover:bg-purple-800"
        >
          Add Clinic
        </button>
      </form>
    </div>
  );
}
