import { useEffect, useState } from "react";
import axios from "../utils/axios";
import DoctorNavbar from "../components/DoctorNavbar";

export default function PatientHistory() {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("/doctor/appointments/past");
                setAppointments(res.data);
            } catch (err) {
                console.error("Failed to fetch patient history:", err);
                alert("Unable to load patient history.");
            }
        };

        fetchHistory();
    }, []);

    return (
        <>
            <DoctorNavbar />
            <div className="min-h-screen bg-slate-50 p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Patient Appointment History</h2>

                {appointments.length === 0 ? (
                    <p className="text-slate-500 text-center">No past appointments found.</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="bg-white rounded-lg shadow p-5">
                                <h3 className="font-semibold text-slate-800">{apt.patient_name}</h3>
                                <p className="text-slate-600 text-sm">Date: {apt.date}</p>
                                <p className="text-slate-600 text-sm">Time: {apt.time}</p>
                                {apt.reason && (
                                    <p className="text-slate-500 text-sm">Reason: {apt.reason}</p>
                                )}
                                <p className="text-slate-400 text-xs mt-1">Status: {apt.status || "Completed"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
