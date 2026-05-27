from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.database import db
from app.schemas import ChatRequest, ChatResponse, ProductResponse
from app.auth import get_current_user
from app.config import settings
import json
import urllib.request
import urllib.error

# Import the official unified google-genai SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

router = APIRouter(tags=["AI Skincare Chatbot"])

def call_gemini_genai_sdk(api_key: str, prompt: str, system_instruction: str) -> str:
    """
    Call the official Gemini 2.5 Flash model using the official google-genai unified SDK.
    """
    if not HAS_GENAI:
        print("google-genai SDK not available. Using urllib REST failover.")
        return ""
        
    try:
        # Initialize GenAI Client
        client = genai.Client(api_key=api_key)
        
        # Request generation using gemini-2.5-flash and client models interface
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=800,
                temperature=0.7
            )
        )
        return response.text or ""
    except Exception as e:
        print(f"google-genai SDK Error: {str(e)}")
        return ""

def call_gemini_api_urllib_fallback(api_key: str, prompt: str, system_instruction: str) -> str:
    """
    Direct REST urllib fallback to the Google Gemini API (gemini-1.5-flash)
    if the google-genai package is still compiling or unavailable.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "maxOutputTokens": 800,
            "temperature": 0.7
        }
    }
    
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return ""
    except Exception as e:
        print(f"Google Gemini REST fallback error: {str(e)}")
        return ""

@router.post("/chat", response_model=ChatResponse)
def skincare_chat(chat_req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Intelligent chatbot assistant endpoint. Connects to the official Google Gemini 2.5 Flash
    model using the google-genai SDK to provide specific and updated skincare feedback.
    """
    msg = chat_req.message.lower()
    user_name = current_user.get("full_name", "User")
    user_skin_type = current_user.get("skin_type", "Combination")
    
    reply = ""
    recommended_ids = []
    
    # Check if Gemini API key is configured
    if settings.GEMINI_API_KEY:
        system_instruction = (
            "You are 'SkinSense AI Assistant', an expert board-certified clinical dermatologist chatbot "
            "tailored for an Indian audience. Your brand name is SkinSense AI.\n"
            f"The active patient's name is {user_name} and their skin type is {user_skin_type}.\n"
            "Provide specific, updated, and highly accurate medical skincare advice.\n"
            "When mentioning products, denominate all prices in Indian Rupees (₹) and suggest Indian "
            "dermatologist-favored brands like Minimalist, The Derma Co, Plum Goodness, Re'equil, Kama Ayurveda, or Forest Essentials.\n"
            "Suggest key active skincare ingredients like Salicylic Acid, Hyaluronic Acid, Niacinamide, Retinol, "
            "Vitamin C, or Ceramides according to their skin suitability.\n"
            "Keep your tone professional, empathetic, and clinical. Keep responses concise (under 2-3 paragraphs) "
            "and use clean markdown formatting (bullet points, bold text)."
        )
        
        # Primary: Call using the new official google-genai SDK and Gemini 2.5 Flash
        if HAS_GENAI:
            reply = call_gemini_genai_sdk(settings.GEMINI_API_KEY, chat_req.message, system_instruction)
            
        # Secondary: REST fallback using gemini-1.5-flash if SDK import fails
        if not reply:
            reply = call_gemini_api_urllib_fallback(settings.GEMINI_API_KEY, chat_req.message, system_instruction)
        
    # Local Rule-based fallback if no Gemini key is configured or API errors occur
    if not reply:
        if "acne" in msg or "pimple" in msg or "breakout" in msg or "blemish" in msg:
            reply = (
                f"Hello {user_name}. Since your skin type is listed as {user_skin_type}, "
                "managing breakouts requires an active that clears sebum without stripping the moisture barrier. "
                "I highly recommend using **Salicylic Acid (BHA)**. BHA is oil-soluble, meaning it penetrates deep into pores "
                "to dissolve acne-triggering cellular debris. Pairing it with Niacinamide will soothe redness and regulate oil production. "
                "Avoid squeezing blemishes, which causes permanent hyperpigmentation and scarring."
            )
            recommended_ids = ["prod_2", "prod_4"]
            
        elif "dry" in msg or "hydrate" in msg or "moisture" in msg or "flak" in msg:
            reply = (
                f"Hi {user_name}. Dry skin can feel tight and sensitive. It indicates a compromised skin lipid barrier. "
                "You should incorporate humectants like **Hyaluronic Acid**, which attracts 1000x its weight in water, "
                "and **Ceramides** to seal that moisture inside your cells. "
                "Always apply your hydration serums on damp skin, and lock it in with a rich cream rather than a lotion."
            )
            recommended_ids = ["prod_1", "prod_5", "prod_3"]
            
        elif "wrinkle" in msg or "aging" in msg or "fine line" in msg or "sag" in msg:
            reply = (
                f"Hello {user_name}. Fine lines and wrinkles are primarily caused by collagen degradation and UV damage. "
                "The gold standard for aging skin is **Retinol**. It speeds up epidermal turnover and triggers new collagen production. "
                "Start by applying a low concentration of Retinol 2-3 nights a week, followed by a thick peptide cream. "
                "**CRITICAL:** Always wear broad-spectrum SPF 50 during the day, as Retinol makes skin highly photosensitive."
            )
            recommended_ids = ["prod_5", "prod_6"]
            
        elif "dark circle" in msg or "pigment" in msg or "brighten" in msg or "spots" in msg:
            reply = (
                f"Hi {user_name}. Hyperpigmentation and dark circles can stem from sun damage, sleep deprivation, or genetics. "
                "Look for active agents like **Vitamin C**, **Niacinamide**, or **Ferulic Acid**. "
                "Vitamin C is a powerful antioxidant that blocks melanin production. Niacinamide stops melanin transfer to surface skin cells. "
                "Use a Vitamin C cream in the morning and a strong Niacinamide serum at night, coupled with a reliable sunscreen."
            )
            recommended_ids = ["prod_3", "prod_4", "prod_6"]
            
        elif "sensitive" in msg or "red" in msg or "irritat" in msg or "burn" in msg:
            reply = (
                f"Hello {user_name}. Dealing with hypersensitivity requires a 'less is more' approach. Your skin barrier is likely irritated. "
                "Cease all strong exfoliating acids (like Glycolic or Salicylic) and Retinols immediately. "
                "Focus entirely on barrier recovery using **Centella Asiatica (Cica)**, **Panthenol (Vitamin B5)**, and **Ceramides**. "
                "Cleansers should be non-foaming and pH-balanced. Never rub or scrub your face."
            )
            recommended_ids = ["prod_4", "prod_1"]
            
        else:
            reply = (
                f"Hello {user_name}! I am your SkinSense AI clinical assistant. "
                f"I see that your diagnosed skin type is **{user_skin_type}**. "
                "You can ask me anything about your skincare routine! Try asking:\n"
                "- *'How can I clear my acne breakouts?'*\n"
                "- *'What ingredients work best for dark circles?'*\n"
                "- *'How do I repair dry, flaky skin?'*"
            )
            recommended_ids = ["prod_1", "prod_6"]

    # Dynamic semantic product tagger from the generated response text
    if not recommended_ids:
        reply_lower = reply.lower()
        if any(w in reply_lower for w in ["acne", "pimple", "breakout", "salicylic", "bha"]):
            recommended_ids = ["prod_2", "prod_4"]
        elif any(w in reply_lower for w in ["dry", "hydrate", "moistur", "hyaluronic", "lipid"]):
            recommended_ids = ["prod_1", "prod_5", "prod_3"]
        elif any(w in reply_lower for w in ["wrinkle", "aging", "fine line", "retinol"]):
            recommended_ids = ["prod_5", "prod_6"]
        elif any(w in reply_lower for w in ["pigment", "dark circle", "bright", "vitamin c", "niacinamide"]):
            recommended_ids = ["prod_3", "prod_4", "prod_6"]
        elif any(w in reply_lower for w in ["sensitive", "red", "sooth", "barrier", "irritat", "ceramide"]):
            recommended_ids = ["prod_4", "prod_1"]
        else:
            recommended_ids = ["prod_1", "prod_6"]

    # Fetch matched products from database
    recommended_products = []
    for pid in recommended_ids:
        prod = db.find_one("products", {"id": pid})
        if prod:
            if "reviews" not in prod:
                prod["reviews"] = []
            recommended_products.append(prod)
            
    return ChatResponse(reply=reply, recommended_products=recommended_products)
