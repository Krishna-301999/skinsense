from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from app.database import db
from app.schemas import AppointmentBooking, AppointmentResponse
from app.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter(tags=["Dermatologist Consultations"])

# Static list of professional clinical dermatologists localized for India
DERMATOLOGISTS = [
    {
        "id": "doc_1",
        "name": "Dr. Rashmi Shetty",
        "specialty": "Acne & Aesthetic Expert",
        "experience": "15 years",
        "rating": 4.9,
        "availability": ["10:00 AM - 01:00 PM IST", "03:00 PM - 06:00 PM IST"],
        "charge": 1200.0,
        "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
        "bio": "Dr. Shetty is a leading Indian aesthetic dermatologist specializing in Indian skin phototypes, hyperpigmentation, and hormonal acne therapeutics."
    },
    {
        "id": "doc_2",
        "name": "Dr. Jaishree Sharad",
        "specialty": "Cosmetic & Anti-Aging Therapies",
        "experience": "20 years",
        "rating": 4.8,
        "availability": ["11:00 AM - 02:00 PM IST", "04:00 PM - 07:00 PM IST"],
        "charge": 1500.0,
        "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
        "bio": "Dr. Jaishree is an author and board-certified cosmetic dermatologist, specializing in Indian skin aging patterns, collagen boosting, and advanced laser therapies."
    },
    {
        "id": "doc_3",
        "name": "Dr. Anjali Mahto",
        "specialty": "Sensitive Skin & Rosacea Care",
        "experience": "12 years",
        "rating": 4.9,
        "availability": ["09:00 AM - 12:00 PM IST", "02:00 PM - 05:00 PM IST"],
        "charge": 1000.0,
        "avatar": "https://images.unsplash.com/photo-1594824813573-246434e3b96f?q=80&w=200&auto=format&fit=crop",
        "bio": "Dr. Anjali focuses on acute eczema, tropical heat-induced rosacea, and barrier repair therapies optimized for highly sensitive Indian skin phototypes."
    }
]

@router.get("/dermatologists", response_model=List[Dict[str, Any]])
def get_dermatologists():
    """Retrieve the catalog of clinical board-certified dermatologists available for video consultation."""
    return DERMATOLOGISTS

@router.post("/book-consultation", response_model=AppointmentResponse)
def book_consultation(booking: AppointmentBooking, current_user: dict = Depends(get_current_user)):
    """Book a new dermatologist appointment, generating a unique WebRTC Agora room code."""
    # Verify doctor exists
    doctor = next((doc for doc in DERMATOLOGISTS if doc["id"] == booking.doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Selected dermatologist profile not found")
        
    # Check if slot is already booked for this doctor (mock check)
    existing_appointment = db.find_one("appointments", {
        "doctor_id": booking.doctor_id,
        "date": booking.date,
        "time_slot": booking.time_slot,
        "status": "Scheduled"
    })
    if existing_appointment:
        raise HTTPException(
            status_code=400, 
            detail="This time slot has already been reserved. Please select another slot or doctor."
        )

    # Generate a unique video room code
    room_id = f"room_{uuid.uuid4().hex[:12]}"
    
    appointment_data = {
        "id": f"apt_{uuid.uuid4().hex[:8]}",
        "user_id": current_user["id"],
        "doctor_id": booking.doctor_id,
        "doctor_name": doctor["name"],
        "date": booking.date,
        "time_slot": booking.time_slot,
        "status": "Scheduled",
        "room_id": room_id,
        "notes": booking.notes,
        "created_at": datetime.utcnow().isoformat()
    }
    
    saved_appointment = db.insert("appointments", appointment_data)
    
    # Send a notification to the user
    db.insert("notifications", {
        "user_id": current_user["id"],
        "title": "Appointment Booked",
        "message": f"Your consultation with {doctor['name']} on {booking.date} at {booking.time_slot} has been successfully scheduled.",
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    })
    
    return saved_appointment

@router.get("/appointments/history", response_model=List[AppointmentResponse])
def get_appointments_history(current_user: dict = Depends(get_current_user)):
    """Retrieves all past and upcoming consultation bookings for the logged in user."""
    appointments = db.find_all("appointments", {"user_id": current_user["id"]})
    appointments.sort(key=lambda x: x.get("date", ""), reverse=True)
    return appointments
