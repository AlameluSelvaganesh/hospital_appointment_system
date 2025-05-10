from fastapi import FastAPI, HTTPException, Depends # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.security import OAuth2PasswordBearer # type: ignore
from sqlmodel import SQLModel, Field, create_engine, Session, select # type: ignore
from typing import Optional, List
import bcrypt # type: ignore
from jose import jwt # type: ignore
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv # type: ignore
from pydantic import BaseModel # type: ignore
from fastapi.responses import JSONResponse # type: ignore

# Load environment variables
load_dotenv()
SECRET_KEY = "1uY4ejZm7IvKeJpAcPqvEvR-Ym7japmJ3VUkc8Z6aQE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# App & CORS
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
sqlite_file_name = "healthcare.db"
engine = create_engine(f"sqlite:///{sqlite_file_name}")

# Models
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str
    password_hash: str
    phone_number: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pin_code: str
    role: str  # 'doctor' or 'patient'
    # Patient
    disease_1: Optional[bool] = False
    disease_2: Optional[bool] = False
    disease_3: Optional[bool] = False
    disease_4: Optional[bool] = False
    disease_5: Optional[bool] = False
    other_diseases: Optional[str] = None
    surgery_history: Optional[str] = None
    # Doctor
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    hospital_affiliated: Optional[str] = None
    languages_spoken: Optional[str] = None
    available_slots_per_day: Optional[int] = None

class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    doctor_id: int
    patient_id: int
    date: str
    time: str
    status: str = "booked"
    reason: Optional[str] = None  # ✅ REASON INCLUDED

class UserCreate(SQLModel):
    full_name: str
    email: str
    password: str
    phone_number: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pin_code: str
    role: str
    disease_1: Optional[bool] = False
    disease_2: Optional[bool] = False
    disease_3: Optional[bool] = False
    disease_4: Optional[bool] = False
    disease_5: Optional[bool] = False
    other_diseases: Optional[str] = None
    surgery_history: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    hospital_affiliated: Optional[str] = None
    languages_spoken: Optional[str] = None
    available_slots_per_day: Optional[int] = None

class UserLogin(SQLModel):
    email: str
    password: str

class AppointmentCreate(SQLModel):
    date: str
    time: str
    reason: Optional[str] = None  # ✅ REASON INCLUDED

class DoctorAvailability(BaseModel):
    time_ranges: List[dict]
    slots_per_day: int
    unavailable_dates: List[str]

# TEMPORARY: In-memory storage
availability_storage = {}

# Auth Utilities
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(data: dict, expires: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

@app.on_event("startup")
def on_start():
    SQLModel.metadata.create_all(engine)

# Routes
@app.post("/signup")
def signup(data: UserCreate):
    with Session(engine) as session:
        if session.exec(select(User).where(User.email == data.email)).first():
            raise HTTPException(400, detail="Email already exists")
        user = User(**data.dict(exclude={"password"}), password_hash=hash_password(data.password))
        session.add(user)
        session.commit()
        return {"message": "User created"}

@app.post("/signin")
def signin(creds: UserLogin):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == creds.email)).first()
        if not user or not verify_password(creds.password, user.password_hash):
            raise HTTPException(401, detail="Invalid credentials")
        token = create_token({"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/doctor/profile")
def update_doctor(data: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(403, detail="Unauthorized")
    with Session(engine) as session:
        doc = session.get(User, current_user.id)
        for k, v in data.dict(exclude_unset=True).items():
            setattr(doc, k, v)
        session.add(doc)
        session.commit()
        return {"message": "Updated"}

@app.get("/doctors")
def get_doctors():
    with Session(engine) as session:
        return session.exec(select(User).where(User.role == "doctor")).all()

@app.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: int):
    with Session(engine) as session:
        doc = session.get(User, doctor_id)
        if not doc or doc.role != "doctor":
            raise HTTPException(404, detail="Doctor not found")

        availability = availability_storage.get(doctor_id, {
            "time_ranges": [],
            "slots_per_day": doc.available_slots_per_day or 10,
            "unavailable_dates": []
        })

        return {
            "id": doc.id,
            "full_name": doc.full_name,
            "specialization": doc.specialization,
            "languages_spoken": doc.languages_spoken,
            "available_slots_per_day": doc.available_slots_per_day,
            "time_ranges": availability["time_ranges"],
            "unavailable_dates": availability["unavailable_dates"]
        }

@app.post("/doctors/{doctor_id}/appointments")
def book(doctor_id: int, data: AppointmentCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(403, detail="Only patients can book")
    
    with Session(engine) as session:
        doctor = session.get(User, doctor_id)
        if not doctor:
            raise HTTPException(404, detail="Doctor not found")

        # Check if the doctor is fully booked for the day
        daily_count = session.exec(select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.date == data.date,
            Appointment.status == "booked"
        )).all()

        if doctor.available_slots_per_day and len(daily_count) >= doctor.available_slots_per_day:
            raise HTTPException(409, detail="Fully booked for the day")

        # ✅ Allow up to 3 bookings per time slot
        slot_bookings = session.exec(select(Appointment).where(
            Appointment.doctor_id == doctor_id,
            Appointment.date == data.date,
            Appointment.time == data.time,
            Appointment.status == "booked"
        )).all()

        if len(slot_bookings) >= 3:
            raise HTTPException(409, detail="This time slot is full. Please select another time.")

        # Proceed to book
        appt = Appointment(
            doctor_id=doctor_id,
            patient_id=current_user.id,
            date=data.date,
            time=data.time,
            reason=data.reason
        )
        session.add(appt)
        session.commit()
        return {"message": "Booked"}


@app.delete("/appointments/{appointment_id}")
def cancel(appointment_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        appt = session.get(Appointment, appointment_id)
        if not appt:
            raise HTTPException(404, detail="Not found")
        if current_user.id not in [appt.patient_id, appt.doctor_id]:
            raise HTTPException(403, detail="Unauthorized")
        appt.status = "canceled"
        session.add(appt)
        session.commit()
        return {"message": "Canceled"}

@app.put("/appointments/{appointment_id}/complete")
def complete(appointment_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        appt = session.get(Appointment, appointment_id)
        if not appt or appt.doctor_id != current_user.id:
            raise HTTPException(403, detail="Unauthorized")
        appt.status = "completed"
        session.add(appt)
        session.commit()
        return {"message": "Marked as completed"}

@app.get("/doctor/appointments")
def doctor_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(403)
    with Session(engine) as session:
        return session.exec(select(Appointment).where(
            Appointment.doctor_id == current_user.id,
            Appointment.status == "booked"
        )).all()

@app.get("/doctor/appointments/today")
def doctor_today(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().date().isoformat()
    with Session(engine) as session:
        return session.exec(select(Appointment).where(
            Appointment.doctor_id == current_user.id,
            Appointment.date == today
        )).all()

@app.get("/doctor/appointments/past")
def doctor_past(current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().date().isoformat()
    with Session(engine) as session:
        return session.exec(select(Appointment).where(
            Appointment.doctor_id == current_user.id,
            Appointment.date < today
        )).all()

@app.get("/appointments/upcoming")
def get_upcoming_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(403, detail="Only patients can access this.")
    
    today = datetime.utcnow().date().isoformat()
    with Session(engine) as session:
        appointments = session.exec(
            select(Appointment).where(
                Appointment.patient_id == current_user.id,
                Appointment.date >= today,
                Appointment.status == "booked"
            )
        ).all()

        result = []
        for appt in appointments:
            doctor = session.get(User, appt.doctor_id)
            result.append({
                "id": appt.id,
                "date": appt.date,
                "time": appt.time,
                "reason": appt.reason,
                "doctor_name": doctor.full_name if doctor else "Unknown"
            })

        return JSONResponse(content=result)


@app.get("/appointments/past")
def get_past_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(403, detail="Only patients can access this.")
    today = datetime.utcnow().date().isoformat()
    with Session(engine) as session:
        return session.exec(
            select(Appointment).where(
                Appointment.patient_id == current_user.id,
                Appointment.date < today
            )
        ).all()

@app.put("/doctor/availability")
def update_availability(data: DoctorAvailability, current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(403)
    availability_storage[current_user.id] = data.dict()
    return {"message": "Availability updated."}

@app.get("/doctor/availability")
def get_availability(current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor":
        raise HTTPException(403)
    return availability_storage.get(current_user.id, {
        "time_ranges": [],
        "slots_per_day": current_user.available_slots_per_day or 10,
        "unavailable_dates": []
    })
