import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { authFetch } from "../auth/utils/authFetch";
import { getStatusWithEmoji } from "./statusEmojis";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const mapContainerStyle = { height: "200px", width: "100%" };

export default function MyAppointments() {
  const { userId, roles } = useAuth();
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isUser = roles.includes("ROLE_USER");

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
  }, [userId]);

  function cancelAppointment(appointmentId) {
    authFetch(`http://localhost:8081/api/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to cancel appointment");
        return res.json();
      })
      .then(updatedAppointment => {
        // Update local appointments state to include updated appointment
        setAppointments(prev =>
          prev.map(app => (app.id === updatedAppointment.id ? updatedAppointment : app))
        );
      })
      .catch(err => {
        console.error(err);
        alert("Error cancelling appointment");
      });
  }

  if (!userId) {
    return (
      <p className="text-center mt-10 text-gray-600 font-medium">
        Please log in to see your appointments.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">My Appointments</h2>

      {error && (
        <p className="mb-6 text-red-600 font-semibold">
          {error}
        </p>
      )}

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          You have no scheduled appointments.
        </p>
      ) : (
        <ul>
          {appointments.map(app => {
            const pet = petsMap[app.petId] || {};
            const clinic = pet.clinic;

            // Show Cancel button only for regular users if appointment status is PENDING or CONFIRMED
            const canCancel = isUser && (app.status === "PENDING" || app.status === "CONFIRMED");

            return (
              <li
                key={app.id}
                className="border border-gray-300 rounded-lg p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-6 mb-4">
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  )}
                  <div className="flex flex-col gap-1 text-gray-800">
                    <div>
                      <strong>Pet Name:</strong> {pet.name || "Loading..."}
                    </div>
                    <div>
                      <strong>Status:</strong> {getStatusWithEmoji(app.status)}
                    </div>
                    <div>
                      <strong>Appointment Date & Time:</strong> {new Date(app.appointmentDate).toLocaleString()}
                    </div>
                    <div>
                      <strong>Reason:</strong> {app.appointmentReason}
                    </div>
                  </div>
                </div>

                {clinic && clinic.latitude && clinic.longitude && (
                  <MapContainer
                    center={[clinic.latitude, clinic.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ ...mapContainerStyle, position: "relative", zIndex: 0 }}
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

                {canCancel && (
                  <button
                    className="mt-4 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={() => cancelAppointment(app.id)}
                  >
                    Cancel
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
