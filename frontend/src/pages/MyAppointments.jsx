import { useEffect, useState } from "react";
import axios from "../utils/axios";
import DoctorNavbar from "../components/DoctorNavbar";

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get("/doctor/appointments");
            setAppointments(res.data);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            alert("Failed to load appointments.");
        }
    };

    const handleCancel = async (id) => {
        const confirm = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirm) return;

        try {
            await axios.delete(`/appointments/${id}`);
            alert("Appointment canceled successfully.");
            fetchAppointments(); // refresh the list
        } catch (err) {
            alert("Failed to cancel appointment.");
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    return (
        <>
            <DoctorNavbar />
            <div className="min-h-screen bg-slate-50 p-6">
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">My Upcoming Appointments</h2>

                {appointments.length === 0 ? (
                    <p className="text-center text-slate-500">No upcoming appointments scheduled.</p>
                ) : (
                    <div className="flex flex-col items-center space-y-6">
                        {appointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-1">{apt.patient_name}</h3>
                                        <p className="text-slate-600">Date: {apt.date}</p>
                                        <p className="text-slate-600">Time: {apt.time}</p>
                                        {apt.reason && (
                                            <p className="text-slate-500 text-sm mt-1">Reason: {apt.reason}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleCancel(apt.id)}
                                        className="bg-red-600 text-white px-4 py-1.5 text-sm font-medium rounded-md hover:bg-red-700 transition-transform hover:scale-105"
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
