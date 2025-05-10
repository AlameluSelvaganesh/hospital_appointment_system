import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "patient";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/signin", form);
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      alert("Login successful!");

      // ✅ Fetch role from backend using /me
      const me = await axios.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const actualRole = me.data.role;
      localStorage.setItem("role", actualRole); // optional, useful for later

      // ✅ Redirect using actual role
      if (actualRole === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">
          Sign In
        </h2>

        <div>
          <label className="block text-slate-700 mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold transform transition-transform hover:scale-105 hover:bg-blue-700"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-slate-600 mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate(`/signup?role=${role}`)}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
}
