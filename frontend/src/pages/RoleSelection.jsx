import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/signin?role=${role}`);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">

      {/* Heading */}
      <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">
        Welcome to HealthCare Portal
      </h1>
      <p className="text-slate-600 text-lg mb-10 text-center">
        Please select your role to continue
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => handleSelect("doctor")}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl text-xl transform transition-all duration-300 hover:scale-105 hover:bg-blue-700"
        >
          I'm a Doctor
        </button>
        <button
          onClick={() => handleSelect("patient")}
          className="px-8 py-4 bg-green-600 text-white rounded-2xl shadow-xl text-xl transform transition-all duration-300 hover:scale-105 hover:bg-green-700"
        >
          I'm a Patient
        </button>
      </div>
    </div>
  );
}
