import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../auth/utils/authFetch";
import { useAuth } from "../auth/context/AuthContext";

export default function BookAppointment() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [appointmentDateTime, setAppointmentDateTime] = useState(null);
  const [error, setError] = useState(null);
  const { userId } = useAuth();

  useEffect(() => {
    authFetch(`http://localhost:8081/api/pets/${petId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch pet details");
        return res.json();
      })
      .then(data => setPet(data))
      .catch(err => setError(err.message));
  }, [petId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!appointmentDateTime) {
      setError("Please select an appointment date.");
      return;
    }

    try {
      const response = await authFetch("http://localhost:8081/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId,
          userId,
          appointmentDateTime: appointmentDateTime.toISOString(),
          appointmentReason: "MEET_AND_GREET",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      navigate("/appointments"); // redirect to appointments page
    } catch (err) {
      setError(err.message);
    }
  };

  if (!pet) {
    return <p>Loading pet information...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Book Meet and Greet Appointment</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <div className="mb-4">
        <img src={pet.imageUrls?.[0]} alt={pet.name} className="w-32 h-32 object-cover rounded" />
        <p className="mt-2 font-bold">{pet.name}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="appointmentDateTime" className="block mb-2 font-medium">
          Select a Date and Time:
        </label>
        <DatePicker
          selected={appointmentDateTime}
          onChange={(date) => setAppointmentDateTime(date)}
          minDate={new Date()}
          showTimeSelect
          timeIntervals={15}
          timeFormat="HH:mm"
          dateFormat="MMMM d, yyyy HH:mm"
          placeholderText="Select a date and time"
          className="w-full p-2 border rounded"
          id="appointmentDateTime"
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}
