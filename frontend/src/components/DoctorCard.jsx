export default function DoctorCard({ doctor, onBook }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-slate-700">{doctor.full_name}</h3>
                <p className="text-slate-500 mt-1">{doctor.specialization}</p>
                <p className="text-slate-400 text-sm mt-2">
                    Languages: {doctor.languages_spoken}
                </p>
                <p className="text-slate-400 text-sm">Experience: {doctor.experience_years} years</p>
            </div>
            <button
                onClick={() => onBook(doctor.id)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
                Book Appointment
            </button>
        </div>
    );
}
