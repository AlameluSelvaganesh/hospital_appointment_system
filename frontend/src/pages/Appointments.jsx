import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/appointments/upcoming");
      console.log("Appointments Response:", res.data);
      setAppointments(res.data);
    } catch (err) {
      alert("Failed to load appointments. Please log in again.");
      navigate("/signin");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`/appointments/${id}`);
      alert("Appointment canceled.");
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 p-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          Upcoming Appointments
        </h2>

        {appointments.length === 0 ? (
          <p className="text-slate-500 text-center">No upcoming appointments.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 justify-items-center">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="w-full max-w-md bg-white p-6 rounded-xl shadow-md transform transition-transform hover:scale-105"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Dr. {apt.doctor_name}
                  </h3>
                  <p className="text-slate-600 mt-1">📅 Date: {apt.date}</p>
                  <p className="text-slate-600">⏰ Time: {apt.time}</p>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => navigate(`/appointments/${apt.id}/edit`)}
                    className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg hover:bg-yellow-600 transition-transform hover:scale-105"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
