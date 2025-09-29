import React, { useEffect, useState } from "react";
import { authFetch } from "../auth/utils/authFetch";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useAuth } from "../auth/context/AuthContext";

const mapContainerStyle = { height: "200px", width: "100%" };

export default function AdminAppointments() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("ROLE_ADMIN");

  const [appointments, setAppointments] = useState([]);
  const [petsMap, setPetsMap] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;

    authFetch("http://localhost:8081/api/appointments") // assuming this returns all appointments for admin
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
      })
      .then(appointmentData => {
        setAppointments(appointmentData);

        const petIds = [...new Set(appointmentData.map(app => app.petId))];

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
                clinic: petData.clinic,
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
  }, [isAdmin]);

  // Confirm appointment function
  function confirmAppointment(appointmentId) {
    authFetch(`http://localhost:8081/api/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to confirm appointment");
        return res.json();
      })
      .then(updatedAppointment => {
        setAppointments(prev =>
          prev.map(app => (app.id === updatedAppointment.id ? updatedAppointment : app))
        );
      })
      .catch(err => {
        console.error(err);
        alert("Error confirming appointment");
      });
  }

  if (!isAdmin) {
    return <p className="text-center mt-10 text-red-600 font-semibold">Access denied</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">All Appointments</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map(app => {
            const pet = petsMap[app.petId] || {};
            const clinic = pet.clinic;

            const canConfirm = app.status === "PENDING";

            return (
              <li key={app.id} className="border border-gray-300 rounded-lg p-6 mb-6 flex flex-col gap-4">
                <div className="flex gap-6 items-center">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  )}
                  <div className="flex-1">
                    <p><strong>Pet Name:</strong> {pet.name || "Loading..."}</p>
                    <p><strong>Status:</strong> {app.status}</p>
                    <p><strong>Appointment Date:</strong> {new Date(app.appointmentDate).toLocaleString()}</p>
                    <p><strong>Reason:</strong> {app.appointmentReason}</p>
                  </div>
                  {canConfirm && (
                    <button
                      onClick={() => confirmAppointment(app.id)}
                      className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Confirm Appointment
                    </button>
                  )}
                </div>
                {clinic && clinic.latitude && clinic.longitude && (
                  <MapContainer
                    center={[clinic.latitude, clinic.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={mapContainerStyle}
                    className="rounded-lg border border-gray-300"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[clinic.latitude, clinic.longitude]}>
                      <Popup>
                        <div className="font-semibold">{clinic.name}</div>
                        <div>{clinic.address}</div>
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
