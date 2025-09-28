import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { authFetch } from "../auth/utils/authFetch";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const mapContainerStyle = { height: "200px", width: "100%" };

export default function MyAppointments() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [petsMap, setPetsMap] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    authFetch(`http://localhost:8081/api/appointments/user/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
      })
      .then(appointmentData => {
        setAppointments(appointmentData);

        // Extract unique petIds
        const petIds = [...new Set(appointmentData.map(app => app.petId))];

        // Fetch pet details in parallel
        return Promise.all(
          petIds.map(id =>
            authFetch(`http://localhost:8081/api/pets/${id}`)
              .then(res => {
                if (!res.ok) throw new Error("Failed to fetch pet details");
                return res.json();
              })
              .then(petData => ({
                id,
                name: petData.name,
                imageUrl: petData.imageUrls?.[0] || "",
                clinic: petData.clinic, // Include clinic info
              }))
          )
        );
      })
      .then(petsData => {
        const map = {};
        petsData.forEach(pet => {
          map[pet.id] = {
            name: pet.name,
            imageUrl: pet.imageUrl,
            clinic: pet.clinic,
          };
        });
        setPetsMap(map);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [userId]);

  if (!userId) return <p>Please log in to see your appointments.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {appointments.length === 0 ? (
        <p>You have no scheduled appointments.</p>
      ) : (
        <ul>
          {appointments.map(app => {
            const pet = petsMap[app.petId] || {};
            const clinic = pet.clinic;

            return (
              <li key={app.id} className="border p-4 rounded mb-4">
                <div className="flex items-center gap-4 mb-2">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded" />
                  )}
                  <div>
                    <div>Pet Name: <strong>{pet.name || "Loading..."}</strong></div>
                    <div>Status: {app.status}</div>
                    <div>Appointment Date: {new Date(app.appointmentDate).toLocaleString()}</div>
                    <div>Reason: {app.appointmentReason}</div>
                  </div>
                </div>

                {clinic && clinic.latitude && clinic.longitude && (
                  <MapContainer
                    center={[clinic.latitude, clinic.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={mapContainerStyle}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[clinic.latitude, clinic.longitude]}>
                      <Popup>
                        {clinic.name}<br />{clinic.address}
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
