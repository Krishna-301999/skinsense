import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    PROJECT_NAME: str = "SkinSense AI API"
    PROJECT_VERSION: str = "1.0.0"
    
    # Security & Authentication
    # In production, change this to a secure random key
    JWT_SECRET: str = os.getenv("JWT_SECRET", "9f848c77502b4d1b824a7cf5d5cde78a2fb6efbbec8d4c1b9b1e95f68c4a169b")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = "skinsense_db"
    
    # Google Maps Credentials
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    
    # Google Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Payment Integration (Placeholders)
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock_id_12345")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret_abcde")
    STRIPE_API_KEY: str = os.getenv("STRIPE_API_KEY", "sk_test_mock_stripe_key_12345")
    
    # Video Consultation (Agora Placeholder)
    AGORA_APP_ID: str = os.getenv("AGORA_APP_ID", "mock_agora_app_id_98765")
    AGORA_APP_CERTIFICATE: str = os.getenv("AGORA_APP_CERTIFICATE", "mock_agora_certificate_67890")

settings = Settings()
