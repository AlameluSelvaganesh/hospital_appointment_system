import { useState, useEffect } from "react";
import DoctorNavbar from "../components/DoctorNavbar";
import axios from "../utils/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ManageAvailability() {
    const [timeRanges, setTimeRanges] = useState([{ from: "10:00", to: "14:00" }]);
    const [slotsPerDay, setSlotsPerDay] = useState(10);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await axios.get("/doctor/availability");
                setTimeRanges(res.data.time_ranges || []);
                setSlotsPerDay(res.data.slots_per_day || 10);
                setUnavailableDates(res.data.unavailable_dates?.map((d) => new Date(d)) || []);
            } catch (err) {
                console.error("Failed to load availability:", err);
            }
        };
        fetchAvailability();
    }, []);

    const handleAddRange = () => {
        setTimeRanges([...timeRanges, { from: "", to: "" }]);
    };

    const handleRemoveRange = (index) => {
        const updated = [...timeRanges];
        updated.splice(index, 1);
        setTimeRanges(updated);
    };

    const handleRangeChange = (index, field, value) => {
        const updated = [...timeRanges];
        updated[index][field] = value;
        setTimeRanges(updated);
    };

    const toggleUnavailableDate = (date) => {
        const exists = unavailableDates.find((d) => d.toDateString() === date.toDateString());
        if (exists) {
            setUnavailableDates(unavailableDates.filter((d) => d.toDateString() !== date.toDateString()));
        } else {
            setUnavailableDates([...unavailableDates, date]);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                time_ranges: timeRanges,
                slots_per_day: slotsPerDay,
                unavailable_dates: unavailableDates.map((d) => d.toISOString().split("T")[0]),
            };
            await axios.put("/doctor/availability", payload);
            alert("Availability updated successfully!");
        } catch (err) {
            alert("Failed to save availability.");
        }
    };

    return (
        <>
            <DoctorNavbar />
            <div className="min-h-screen bg-slate-50 p-6 md:px-12 lg:px-24">
                <h2 className="text-3xl font-bold text-slate-800 mb-8">Manage Availability</h2>

                <div className="mb-8">
                    <label className="block text-slate-700 font-medium mb-2">Total Slots Per Day</label>
                    <input
                        type="number"
                        min="1"
                        value={slotsPerDay}
                        onChange={(e) => setSlotsPerDay(Number(e.target.value))}
                        className="border border-slate-300 p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Time Ranges</h3>
                <div className="space-y-4 mb-8">
                    {timeRanges.map((range, idx) => (
                        <div key={idx} className="flex flex-wrap gap-4 items-center">
                            <input
                                type="time"
                                value={range.from}
                                onChange={(e) => handleRangeChange(idx, "from", e.target.value)}
                                className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-slate-500 font-medium">to</span>
                            <input
                                type="time"
                                value={range.to}
                                onChange={(e) => handleRangeChange(idx, "to", e.target.value)}
                                className="border border-slate-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => handleRemoveRange(idx)}
                                className="text-red-500 hover:text-red-600 text-sm font-medium"
                            >
                                ✖ Remove
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={handleAddRange}
                        className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
                    >
                        ➕ Add Time Range
                    </button>
                </div>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Mark Unavailable Dates</h3>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        toggleUnavailableDate(date);
                    }}
                    inline
                    highlightDates={unavailableDates}
                    dayClassName={(date) =>
                        unavailableDates.find((d) => d.toDateString() === date.toDateString())
                            ? "bg-red-400 text-white rounded-full"
                            : undefined
                    }
                />

                <button
                    onClick={handleSave}
                    className="mt-12 pt-2 bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-green-700 transform transition hover:scale-105"
                >
                    ✅ Save Availability
                </button>

            </div>
        </>
    );
}
