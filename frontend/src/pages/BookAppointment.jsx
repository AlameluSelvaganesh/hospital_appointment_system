import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../components/Navbar";

export default function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");
    const [doctor, setDoctor] = useState(null);
    const [unavailableDates, setUnavailableDates] = useState([]);

    // Fetch doctor details
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get(`/doctors/${doctorId}`);
                setDoctor(res.data);
                setUnavailableDates(
                    (res.data.unavailable_dates || []).map((d) => new Date(d))
                );
            } catch (err) {
                alert("Failed to load doctor info.");
                navigate("/dashboard");
            }
        };
        fetchDoctor();
    }, [doctorId]);

    // Generate equal time slots
    useEffect(() => {
        if (!selectedDate || !doctor) return;

        try {
            const now = new Date();
            const slots = [];
            const totalSlots = doctor.available_slots_per_day || 6;

            const rawRanges = Array.isArray(doctor.time_ranges) ? doctor.time_ranges : [];
            const timeRanges = rawRanges.filter(
                (r) => r && typeof r.start === "string" && typeof r.end === "string"
            );

            const finalRanges = timeRanges.length > 0
                ? timeRanges
                : [
                    { start: "08:00", end: "11:00" },
                    { start: "16:00", end: "20:00" }
                ];

            let totalMinutes = 0;
            const rangesWithMinutes = finalRanges.map(({ start, end }) => {
                const [sh, sm] = start.split(":").map(Number);
                const [eh, em] = end.split(":").map(Number);
                const minutes = (eh * 60 + em) - (sh * 60 + sm);
                totalMinutes += minutes;
                return { startHour: sh, startMin: sm, duration: minutes };
            });

            const minutesPerSlot = Math.floor(totalMinutes / totalSlots);
            const adjustedSlot = Math.max(Math.ceil(minutesPerSlot / 10) * 10, 10); // Round to nearest 10 mins

            let slotsGenerated = 0;

            rangesWithMinutes.forEach(({ startHour, startMin, duration }) => {
                let current = new Date(selectedDate);
                const roundedMin = Math.ceil(startMin / 10) * 10; // round start min
                current.setHours(startHour, roundedMin, 0, 0);

                const rangeEnd = new Date(current.getTime() + duration * 60 * 1000);

                while (current < rangeEnd && slotsGenerated < totalSlots) {
                    const slotTime = new Date(current);
                    if (slotTime - now >= 60 * 60 * 1000) {
                        slots.push(slotTime);
                        slotsGenerated++;
                    }
                    current = new Date(current.getTime() + adjustedSlot * 60 * 1000);
                }
            });

            setAvailableTimes(slots);
            setSelectedTime("");
        } catch (err) {
            console.error("Slot generation error:", err);
        }
    }, [selectedDate, doctor]);



    // Submit booking
    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select both date and time.");
            return;
        }

        try {
            await axios.post(`/doctors/${doctorId}/appointments`, {
                date: selectedDate.toISOString().split("T")[0],
                time: selectedTime,
                reason: reason.trim() || null,
            });

            alert("Appointment booked successfully!");
            const role = localStorage.getItem("role") || "patient";
            navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");

        } catch (err) {
            alert(err.response?.data?.detail || "Booking failed");
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4 text-center">
                        Book Appointment with {doctor?.full_name || "Doctor"}
                    </h2>

                    {/* Date picker */}
                    <label className="block text-slate-600 mb-2">Select a date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        minDate={new Date()}
                        excludeDates={unavailableDates}
                        className="w-full border p-2 rounded-md mb-4"
                        placeholderText="Choose a date"
                    />

                    {/* Time buttons */}
                    {availableTimes.length > 0 && (
                        <>
                            <label className="block text-slate-600 mb-2">Select time:</label>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {availableTimes.map((slot, idx) => {
                                    const timeStr = slot.toTimeString().substring(0, 5);
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedTime(timeStr)}
                                            className={`py-2 px-3 rounded-md border transition ${selectedTime === timeStr
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white border-gray-300 hover:bg-blue-100"
                                                }`}
                                        >
                                            {slot.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Reason */}
                    <label className="block text-slate-600 mb-2">
                        Reason for visit (optional):
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border p-2 rounded-md mb-4"
                        rows={3}
                        placeholder="Describe your symptoms or concern"
                    />

                    {/* Submit */}
                    <button
                        onClick={handleBooking}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </>
    );
}
