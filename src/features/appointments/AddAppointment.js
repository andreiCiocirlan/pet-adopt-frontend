import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { authFetch } from "../auth/utils/authFetch";
import "react-datepicker/dist/react-datepicker.css";

const appointmentStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" }
];

const appointmentReasons = [
  { value: "MEET_AND_GREET", label: "Meet and Greet" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "MEDICAL_CHECKUP", label: "Medical Checkup" },
];

export default function AddAppointment() {
  const navigate = useNavigate();

  const [petId, setPetId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [appointmentDateTime, setAppointmentDateTime] = useState(null);
  const [appointmentReason, setAppointmentReason] = useState("MEET_AND_GREET");
  const [appointmentStatus, setAppointmentStatus] = useState("PENDING");

  const [pets, setPets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch pets and users for select dropdowns
    Promise.all([
      authFetch("http://localhost:8081/api/pets"),
      authFetch("http://localhost:8081/api/users"),
    ])
      .then(async ([petsRes, usersRes]) => {
        if (!petsRes.ok) throw new Error("Failed to fetch pets");
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const petsData = await petsRes.json();
        const usersData = await usersRes.json();
        setPets(petsData.content);
        setUsers(usersData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!petId) {
      setError("Please select a pet.");
      return;
    }
    if (!selectedUser) {
      setError("Please select a user.");
      return;
    }
    if (!appointmentDateTime) {
      setError("Please select an appointment date and time.");
      return;
    }
    if (!appointmentReason) {
      setError("Please select an appointment reason.");
      return;
    }
    if (!appointmentStatus) {
      setError("Please select an appointment status.");
      return;
    }

    setSubmitting(true);

    const reqBody = {
      petId,
      userId: selectedUser.value,
      appointmentDateTime: appointmentDateTime.toISOString(),
      appointmentReason,
      appointmentStatus
    };

    authFetch("http://localhost:8081/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to create appointment";
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then(() => {
        alert("Appointment created successfully!");
        navigate("/admin-appointments");
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Add Appointment</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Pet:
          <select
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">-- Select a Pet --</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          User:
          <Select
            options={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Search and select a user"
            isClearable
          />
        </label>

        <label>
          Appointment Date & Time:
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

        <label>
          Appointment Reason:
          <select
            value={appointmentReason}
            onChange={(e) => setAppointmentReason(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            {appointmentReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Appointment Status:
          <select
            value={appointmentStatus}
            onChange={(e) => setAppointmentStatus(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            {appointmentStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mt-4"
        >
          {submitting ? "Submitting..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}
