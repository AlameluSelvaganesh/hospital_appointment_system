import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = new URLSearchParams(location.search).get("role");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pin_code: "",
    disease_1: false,
    disease_2: false,
    disease_3: false,
    disease_4: false,
    disease_5: false,
    other_diseases: "",
    surgery_history: "",
    specialization: "",
    license_number: "",
    experience_years: "",
    hospital_affiliated: "",
    languages_spoken: "",
    available_slots_per_day: "",
  });

  useEffect(() => {
    if (!role) navigate("/");
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, role };

    if (role === "doctor") {
      payload.available_slots_per_day = parseInt(payload.available_slots_per_day || "0");
      payload.experience_years = parseInt(payload.experience_years || "0");
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") payload[key] = null;
    });

    try {
      await axios.post("/signup", payload);
      alert("Signup successful! Please login.");
      navigate(`/signin?role=${role}`);
    } catch (err) {
      const error = err.response?.data;
      if (typeof error === "string") {
        alert(error);
      } else if (error?.detail) {
        alert(error.detail);
      } else if (Array.isArray(error)) {
        alert(error.map((e) => `${e?.loc?.[1] || "field"}: ${e?.msg}`).join("\n"));
      } else {
        alert("Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">
          {role === "doctor" ? "Doctor" : "Patient"} Registration
        </h2>

        {[
          "full_name",
          "email",
          "password",
          "phone_number",
          "address_line1",
          "address_line2",
          "city",
          "state",
          "pin_code",
        ].map((field) => (
          <div key={field}>
            <label className="block text-slate-700 mb-1 font-medium">
              {field.replaceAll("_", " ").toUpperCase()}
            </label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required={field !== "address_line2"}
              className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {role === "patient" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <label
                  key={`disease_${i}`}
                  className="flex items-center gap-2 text-slate-700 text-sm"
                >
                  <input
                    type="checkbox"
                    name={`disease_${i}`}
                    checked={formData[`disease_${i}`]}
                    onChange={handleChange}
                  />
                  Disease {i}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">Other Diseases (optional)</label>
              <input
                type="text"
                name="other_diseases"
                value={formData.other_diseases}
                onChange={handleChange}
                className="w-full border border-slate-300 p-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-medium">Surgery History (optional)</label>
              <input
                type="text"
                name="surgery_history"
                value={formData.surgery_history}
                onChange={handleChange}
                className="w-full border border-slate-300 p-3 rounded-lg"
              />
            </div>
          </>
        )}

        {role === "doctor" && (
          <>
            {[
              "specialization",
              "license_number",
              "experience_years",
              "hospital_affiliated",
              "languages_spoken",
              "available_slots_per_day",
            ].map((field) => (
              <div key={field}>
                <label className="block text-slate-700 mb-1 font-medium">
                  {field.replaceAll("_", " ").toUpperCase()}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required={field !== "hospital_affiliated"}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold transform transition-transform hover:scale-105 hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
