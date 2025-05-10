import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import DatePicker from "react-datepicker";
import Navbar from "../components/Navbar";
import "react-datepicker/dist/react-datepicker.css";

export default function EditAppointment() {
    const { id } = useParams(); // appointment ID
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");

    // Fetch appointment details
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/appointments/${id}`);
                const apt = res.data;
                setAppointment(apt);
                setSelectedDate(new Date(`${apt.date}T00:00:00`));
                setSelectedTime(apt.time);

                const doc = await axios.get(`/doctors/${apt.doctor_id}`);
                setDoctor(doc.data);
            } catch (err) {
                alert("Failed to load appointment.");
                navigate("/appointments");
            }
        };
        fetchData();
    }, [id]);

    // Generate available time slots
    useEffect(() => {
        if (selectedDate && doctor?.available_slots_per_day) {
            const now = new Date();
            const slots = [];

            for (let i = 0; i < doctor.available_slots_per_day; i++) {
                const slot = new Date(selectedDate);
                slot.setHours(9 + i);
                slot.setMinutes(0);
                slot.setSeconds(0);

                // ≥ 1 hour ahead
                if (slot.getTime() - now.getTime() >= 60 * 60 * 1000) {
                    slots.push(slot);
                }
            }

            setAvailableTimes(slots);
        }
    }, [selectedDate, doctor]);

    const handleUpdate = async () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select date and time.");
            return;
        }

        try {
            const payload = {
                date: selectedDate.toISOString().split("T")[0],
                time: selectedTime,
            };

            await axios.put(`/appointments/${id}`, payload);
            alert("Appointment updated successfully!");
            navigate("/appointments");
        } catch (err) {
            alert(err.response?.data?.detail || "Update failed");
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-100 flex justify-center items-center px-4 py-10">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                        Edit Appointment with {doctor?.full_name || "Doctor"}
                    </h2>

                    <label className="block text-slate-600 mb-2">Choose new date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        className="w-full border p-2 rounded-md mb-4"
                    />

                    {availableTimes.length > 0 && (
                        <>
                            <label className="block text-slate-600 mb-2">Choose new time:</label>
                            <select
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full border p-2 rounded-md mb-4"
                            >
                                <option value="">-- Select time slot --</option>
                                {availableTimes.map((slot, idx) => (
                                    <option key={idx} value={slot.toTimeString().substring(0, 5)}>
                                        {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <button
                        onClick={handleUpdate}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Confirm Update
                    </button>
                </div>
            </div>
        </>
    );
}
