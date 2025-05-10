import { Link, useNavigate } from "react-router-dom";

export default function DoctorNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out successfully.");
        navigate("/");
    };

    return (
        <nav className="bg-black text-white shadow-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
            {/* Logo / Title */}
            <div
                className="text-2xl font-bold text-green-400 cursor-pointer tracking-tight"
                onClick={() => navigate("/doctor/dashboard")}
            >
                HealthCare • Doctor
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8 text-sm font-medium">
                <Link
                    to="/doctor/dashboard"
                    className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition text-white"
                >
                    Dashboard
                </Link>
                <Link
                    to="/doctor/availability"
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white"
                >
                    Availability
                </Link>
                <Link
                    to="/doctor/appointments"
                    className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white"
                >
                    My Appointments
                </Link>
                <Link
                    to="/doctor/patients"
                    className="px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition text-black"
                >
                    Patients
                </Link>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="ml-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
                Logout
            </button>
        </nav>
    );
}
