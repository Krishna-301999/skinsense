from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from app.database import db
from app.schemas import UserSignup, UserLogin, Token, UserResponse
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

def seed_default_users():
    """Seed sample accounts for out-of-the-box user and admin testing."""
    # Seed standard user
    if not db.find_one("users", {"email": "user@skinsense.ai"}):
        db.insert("users", {
            "email": "user@skinsense.ai",
            "password_hash": get_password_hash("user123"),
            "full_name": "Jane Doe",
            "role": "user",
            "skin_type": "Dry",
            "created_at": datetime.utcnow().isoformat()
        })
    # Seed admin user
    if not db.find_one("users", {"email": "admin@skinsense.ai"}):
        db.insert("users", {
            "email": "admin@skinsense.ai",
            "password_hash": get_password_hash("admin123"),
            "full_name": "Dr. Alex Sterling",
            "role": "admin",
            "skin_type": None,
            "created_at": datetime.utcnow().isoformat()
        })

# Auto-seed users when module loads
seed_default_users()

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserSignup):
    # Check if user already exists
    existing_user = db.find_one("users", {"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists"
        )
        
    new_user = {
        "email": user_in.email,
        "password_hash": get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "role": "user",
        "skin_type": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    saved_user = db.insert("users", new_user)
    saved_user["id"] = saved_user.get("id") or str(saved_user.get("_id"))
    return saved_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # We use OAuth2PasswordRequestForm which reads username and password fields
    user = db.find_one("users", {"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
def login_json(user_in: UserLogin):
    """Alternative login endpoint supporting clean JSON post payloads (helpful for frontend requests)."""
    user = db.find_one("users", {"email": user_in.email})
    if not user or not verify_password(user_in.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
