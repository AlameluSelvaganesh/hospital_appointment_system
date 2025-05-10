import { useEffect, useState } from "react";
import axios from "../utils/axios";
import DoctorNavbar from "../components/DoctorNavbar";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await axios.get("/me");
        setDoctor(docRes.data);

        const aptRes = await axios.get("/doctor/appointments/today");
        setAppointments(aptRes.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        alert("Failed to load dashboard. Please login again.");
      }
    };

    fetchData();
  }, []);

  const markAsCompleted = async (id) => {
    try {
      await axios.put(`/appointments/${id}/complete`);
      alert("Marked as completed.");
      const updated = await axios.get("/doctor/appointments/today");
      setAppointments(updated.data);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const now = new Date();

  const canBeCompleted = (apt) => {
    const [hour, minute] = apt.time.split(":").map(Number);
    const slotDate = new Date(`${apt.date}T${apt.time}`);
    const timeDiff = slotDate.getTime() - now.getTime();
    return timeDiff <= 2 * 60 * 60 * 1000 && timeDiff > 0;
  };

  const upcoming = appointments.filter((a) => a.status === "booked");
  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <>
      <DoctorNavbar />
      <div className="min-h-screen bg-slate-50 px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Welcome, Dr. {doctor?.full_name || "Loading..."}
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow p-5 rounded-lg border-l-4 border-green-500">
            <h4 className="text-slate-500 text-sm">Total Slots Today</h4>
            <p className="text-3xl font-semibold text-green-600 mt-2">
              {doctor?.available_slots_per_day || "--"}
            </p>
          </div>

          <div className="bg-white shadow p-5 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-slate-500 text-sm">Upcoming Appointments</h4>
            <p className="text-3xl font-semibold text-blue-600 mt-2">
              {upcoming.length}
            </p>
          </div>

          <div className="bg-white shadow p-5 rounded-lg border-l-4 border-purple-500">
            <h4 className="text-slate-500 text-sm">Completed Appointments</h4>
            <p className="text-3xl font-semibold text-purple-600 mt-2">
              {completed.length}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Upcoming Appointments
          </h3>

          {upcoming.length === 0 ? (
            <p className="text-slate-500">No upcoming appointments.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((apt) => (
                <div key={apt.id} className="bg-white p-5 rounded-lg shadow flex justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">{apt.patient_name}</h4>
                    <p className="text-slate-600">Time: {apt.time}</p>
                    {apt.reason && <p className="text-slate-500 text-sm">Reason: {apt.reason}</p>}
                    <p className="text-slate-400 text-xs mt-1">Status: {apt.status}</p>
                  </div>
                  {canBeCompleted(apt) && (
                    <button
                      onClick={() => markAsCompleted(apt.id)}
                      className="h-fit text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Appointments */}
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Completed Appointments
          </h3>

          {completed.length === 0 ? (
            <p className="text-slate-500">No completed appointments today.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {completed.map((apt) => (
                <div key={apt.id} className="bg-white p-5 rounded-lg shadow">
                  <h4 className="font-semibold text-slate-800">{apt.patient_name}</h4>
                  <p className="text-slate-600">Time: {apt.time}</p>
                  {apt.reason && <p className="text-slate-500 text-sm">Reason: {apt.reason}</p>}
                  <p className="text-green-600 text-xs mt-1 font-medium">Status: Completed</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
