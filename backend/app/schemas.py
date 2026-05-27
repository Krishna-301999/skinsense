from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Authentication Schemas ---
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, description="Full name must be at least 2 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str = "user"
    skin_type: Optional[str] = None
    created_at: str

# --- Skin Analysis & Reports ---
class FaceRegion(BaseModel):
    label: str
    x: float  # percentage coordinates
    y: float
    width: float
    height: float
    issue: str
    severity: str  # Low, Medium, High
    confidence: float

class SkinMetrics(BaseModel):
    acne: float = Field(..., description="Acne score 0-100")
    wrinkles: float = Field(..., description="Wrinkles score 0-100")
    dark_circles: float = Field(..., description="Dark circles score 0-100")
    pigmentation: float = Field(..., description="Pigmentation score 0-100")
    redness: float = Field(..., description="Redness score 0-100")
    oiliness: float = Field(..., description="Oiliness score 0-100")
    dryness: float = Field(..., description="Dryness score 0-100")

class RoutineStep(BaseModel):
    step: int
    product_type: str
    purpose: str
    active_ingredient: str

class Routine(BaseModel):
    morning: List[RoutineStep]
    night: List[RoutineStep]

class SkinReportResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    overall_score: int
    metrics: SkinMetrics
    regions: List[FaceRegion]
    routine: Routine
    recommended_ingredients: List[str]
    diet_tips: List[str]
    lifestyle_tips: List[str]
    weather_suggestion: str
    face_image: Optional[str] = None
    created_at: str

# --- E-Commerce Schemas ---
class Review(BaseModel):
    username: str
    rating: float
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    price: float
    rating: float
    category: str
    skin_type: str
    description: str
    ingredients: List[str]
    image_url: str
    reviews_count: int
    in_stock: bool
    reviews: Optional[List[Review]] = []

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class OrderRequest(BaseModel):
    items: List[CartItem]
    shipping_address: str
    payment_method: str = "Stripe"

class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[Dict[str, Any]]
    total_amount: float
    status: str
    shipping_address: str
    created_at: str

# --- Dermatologist & Booking Schemas ---
class AppointmentBooking(BaseModel):
    doctor_id: str
    doctor_name: str
    date: str  # YYYY-MM-DD
    time_slot: str  # e.g., "10:00 AM - 10:30 AM"
    notes: Optional[str] = ""

class AppointmentResponse(BaseModel):
    id: str
    user_id: str
    doctor_id: str
    doctor_name: str
    date: str
    time_slot: str
    status: str  # "Scheduled", "Completed", "Cancelled"
    room_id: str
    notes: Optional[str] = ""
    created_at: str

# --- Chatbot Schemas ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    recommended_products: List[ProductResponse] = []
