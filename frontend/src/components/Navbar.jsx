import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out successfully.");
        navigate("/");
    };

    return (
        <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div
                className="text-2xl font-bold text-blue-400 cursor-pointer tracking-tight"
                onClick={() => navigate("/patient/dashboard")}
            >
                HealthCare • Patient
            </div>

            <div className="flex items-center gap-6 text-[15px] font-medium text-white">
                <Link
                    to="/patient/dashboard"
                    className="hover:text-blue-400 transition duration-300"
                >
                    Book Appointment
                </Link>
                <Link
                    to="/patient/appointments"
                    className="hover:text-blue-400 transition duration-300"
                >
                    View Appointments
                </Link>
                <Link
                    to="/patient/appointments/past"
                    className="hover:text-blue-400 transition duration-300"
                >
                    Previous Appointments
                </Link>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition duration-300"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
