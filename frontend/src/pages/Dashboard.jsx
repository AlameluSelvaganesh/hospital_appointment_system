import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get("/doctors");
                setDoctors(res.data);
            } catch (err) {
                console.error("Failed to load doctors:", err.response?.data || err.message);
                alert("Session expired. Please log in again.");
                navigate("/signin");
            }
        };

        fetchDoctors();
    }, [navigate]);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-100 p-8">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
                    Available Doctors
                </h2>

                {doctors.length === 0 ? (
                    <p className="text-center text-slate-500">No doctors available right now.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
                        {doctors.map((doc) => (
                            <div
                                key={doc.id}
                                className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{doc.full_name}</h3>
                                    <p className="text-slate-600">{doc.specialization}</p>
                                    <p className="text-slate-500 text-sm mt-2">
                                        Languages: {doc.languages_spoken}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/patient/book/${doc.id}`)}
                                    className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-transform hover:scale-105"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
