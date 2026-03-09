import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import { useAuth } from "../auth/context/AuthContext";
import Carousel from "./components/Carousel";
import "./utils/leafletSetup";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Syringe, Cpu, Scissors } from "lucide-react";
import { getBreedDisplayName } from "./utils/breeds.js";

function PetDetails() {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const { userId, roles } = useAuth();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    authFetch(`http://localhost:8081/api/pets/${petId}`)
      .then(res => res.json())
      .then(setPet)
      .catch(console.error);
  }, [petId]);

  useEffect(() => {
    if (isAdmin) {
      authFetch(`http://localhost:8081/api/clinics`)
        .then(res => res.json())
        .then(setClinics)
        .catch(console.error);
    }
  }, [isAdmin]);

  if (!pet) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  function handleMeetAndGreetClick() {
    if (!userId) {
      navigate("/login", { state: { from: location } });
    } else {
      navigate(`/book-appointment/${pet.id}`);
    }
  }

  function handleAssignClinic() {
    if (!selectedClinicId) {
      alert("Please select a clinic");
      return;
    }
    authFetch(`http://localhost:8081/api/pets/${pet.id}/clinic/${selectedClinicId}`, {
      method: "PATCH",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to assign clinic");
        return res.json();
      })
      .then(updatedPet => {
        setPet(updatedPet);
        setSelectedClinicId("");
        alert("Clinic assigned successfully");
      })
      .catch(err => {
        console.error(err);
        alert("Error assigning clinic");
      });
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <Carousel images={pet.imageUrls || [pet.imageUrl]} />

      <h1 className="text-4xl font-extrabold mt-6 mb-4 text-gray-900">{pet.name}</h1>

      <div className="text-gray-700 space-y-2">
        <p><span className="font-semibold">Characteristics:</span> {pet.characteristics}</p>
        <p><span className="font-semibold">Breed:</span> {getBreedDisplayName(pet.breed)}</p>
        <p><span className="font-semibold">Age:</span> {pet.age} years</p>

        {/* ✅ New Medical & Care Status Section with Icons */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Medical & Care Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Neutered/Spayed */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Scissors className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-sm text-gray-600">Neutered/Spayed</p>
                <p className={`font-semibold ${pet.isNeutered ? 'text-green-600' : 'text-red-600'}`}>
                  {pet.isNeutered ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Vaccinated */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Syringe className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-sm text-gray-600">Vaccinated</p>
                <p className={`font-semibold ${pet.isVaccinated ? 'text-green-600' : 'text-red-600'}`}>
                  {pet.isVaccinated ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Microchipped */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Cpu className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-sm text-gray-600">Microchipped</p>
                <p className={`font-semibold ${pet.hasMicrochip ? 'text-green-600' : 'text-red-600'}`}>
                  {pet.hasMicrochip ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pet.clinic ? (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner flex flex-row items-start gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">Clinic Details</h2>
            <p><span className="font-medium">Name:</span> {pet.clinic.name}</p>
            <p><span className="font-medium">Address:</span> {pet.clinic.address}</p>
            {pet.clinic.phoneNumber && (
              <p><span className="font-medium">Phone:</span> {pet.clinic.phoneNumber}</p>
            )}
          </div>

          {pet.clinic.latitude && pet.clinic.longitude && (
            <div className="flex-none w-[400px] h-[200px] rounded-lg overflow-hidden border border-gray-300 shadow-sm">
              <MapContainer
                center={[pet.clinic.latitude, pet.clinic.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[pet.clinic.latitude, pet.clinic.longitude]}>
                  <Popup>
                    {pet.clinic.name}<br />{pet.clinic.address}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      ) : (
        isAdmin ? (
          <div className="mt-8">
            <label htmlFor="clinicSelect" className="block mb-2 font-semibold text-gray-700">
              Assign Clinic
            </label>
            <select
              id="clinicSelect"
              value={selectedClinicId}
              onChange={e => setSelectedClinicId(e.target.value)}
              className="w-full max-w-xs border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Clinic --</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignClinic}
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Assign Clinic
            </button>
          </div>
        ) : (
          <p className="mt-6 text-gray-500 italic">No clinic information available.</p>
        )
      )}

      <div className="mt-10">
        {/* Meet and Greet - Only for Non-Admin Users */}
        {!isAdmin && (
          <div className="flex justify-left">
            {pet.status === "AVAILABLE" ? (
              <button
                onClick={handleMeetAndGreetClick}
                className="w-1/2 px-8 py-4 text-lg font-semibold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400"
              >
                Meet and Greet
              </button>
            ) : (
              <p className="w-1/2 px-8 py-4 text-lg font-semibold bg-gray-400 text-white rounded-lg text-center cursor-not-allowed">
                Not Available for Adoption
              </p>
            )}
          </div>
        )}

        {/* Edit Pet - Only for Admin Users */}
        {isAdmin && (
          <div className="flex justify-left">
            <button
              onClick={() => navigate(`/pets/${pet.id}/edit`)}
              className="w-1/2 px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              Edit Pet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetDetails;
