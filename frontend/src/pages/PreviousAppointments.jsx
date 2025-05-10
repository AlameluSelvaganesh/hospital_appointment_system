import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/Navbar";

export default function PreviousAppointments() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPastAppointments = async () => {
            try {
                const res = await axios.get("/appointments/past");
                setAppointments(res.data);
            } catch (err) {
                alert("Session expired. Please login again.");
                navigate("/signin");
            }
        };

        fetchPastAppointments();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-100 p-6">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
                    Previous Appointments
                </h2>

                {appointments.length === 0 ? (
                    <p className="text-center text-slate-500">No past appointments found.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 justify-items-center">
                        {appointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="w-full max-w-md bg-white p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105"
                            >
                                <h3 className="text-xl font-semibold text-slate-800 mb-1">{apt.doctor_name}</h3>
                                <p className="text-slate-600">📅 Date: {apt.date}</p>
                                <p className="text-slate-600">⏰ Time: {apt.time}</p>
                                {apt.status && (
                                    <p className="text-slate-500 text-sm mt-1">Status: {apt.status}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
