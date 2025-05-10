import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection.jsx";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import Appointments from "./pages/Appointments.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EditAppointment from "./pages/EditAppointment.jsx";
import PreviousAppointments from "./pages/PreviousAppointments.jsx";
import ManageAvailability from "./pages/ManageAvailability.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import PatientHistory from "./pages/PatientHistory.jsx";


function App() {
  return (
    <Router>
      <Routes>
        {/* Common */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<Dashboard />} />
        <Route path="/patient/appointments" element={<Appointments />} />
        <Route path="/patient/appointments/:id/edit" element={<EditAppointment />} />
        <Route path="/patient/appointments/past" element={<PreviousAppointments />} />
        <Route path="/patient/book/:doctorId" element={<BookAppointment />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/availability" element={<ManageAvailability />} />
        <Route path="/doctor/appointments" element={<MyAppointments />} />
        <Route path="/doctor/patients" element={<PatientHistory />} />
      </Routes>

    </Router>
  );
}

export default App;
