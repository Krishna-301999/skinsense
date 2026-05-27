from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List, Dict, Any, Optional
from app.database import db
from app.schemas import SkinReportResponse, SkinMetrics, FaceRegion, Routine, RoutineStep
from app.auth import get_current_user
from datetime import datetime
import random
from PIL import Image
import io

router = APIRouter(tags=["Skin Analysis"])

@router.post("/analyze-skin", response_model=SkinReportResponse)
async def analyze_skin(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Receives a face selfie image, processes it to verify it is a valid image, 
    and simulates a high-fidelity AI-powered skin analysis with localized bounding-box coordinate detections.
    """
    # 1. Basic image verification using Pillow
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image.verify()  # Verifies this is a valid image format
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image. Please capture/upload a JPG or PNG face image."
        )

    # Convert uploaded image to base64 data URL for self-contained UI rendering
    import base64
    mime_type = file.content_type or "image/jpeg"
    base64_image = f"data:{mime_type};base64,{base64.b64encode(contents).decode('utf-8')}"

    # 2. Simulate AI metrics based on small random variance to feel dynamic and real
    # Generate scores (lower score is better for issue metrics, but we represent severity or presence)
    acne_score = round(random.uniform(5.0, 35.0), 1)
    wrinkle_score = round(random.uniform(2.0, 20.0), 1)
    dark_circles_score = round(random.uniform(10.0, 45.0), 1)
    pigmentation_score = round(random.uniform(5.0, 25.0), 1)
    redness_score = round(random.uniform(8.0, 30.0), 1)
    
    # Simulate hydration and oil levels
    oiliness = round(random.uniform(20.0, 85.0), 1)
    dryness = round(random.uniform(15.0, 75.0), 1)

    # Calculate overall skin health score (ranges 72 - 96)
    # Higher is better
    overall_score = int(100 - (acne_score * 0.3 + wrinkle_score * 0.2 + dark_circles_score * 0.15 + pigmentation_score * 0.15 + redness_score * 0.2))
    overall_score = max(50, min(99, overall_score))

    # Classify skin type
    if oiliness > 65:
        skin_type = "Oily"
    elif dryness > 60:
        skin_type = "Dry"
    elif redness_score > 25:
        skin_type = "Sensitive"
    else:
        skin_type = "Combination"

    # Update user's skin type in database
    db.update_one("users", {"email": current_user["email"]}, {"skin_type": skin_type})

    # 3. Simulate specific detected facial regions (x, y, w, h are percentages of image size)
    regions = [
        FaceRegion(
            label="Acne Spot",
            x=0.25,
            y=0.48,
            width=0.08,
            height=0.08,
            issue="Acne/Pimple",
            severity="Medium" if acne_score > 20 else "Low",
            confidence=round(random.uniform(0.78, 0.94), 2)
        ),
        FaceRegion(
            label="Dark Circles",
            x=0.28,
            y=0.36,
            width=0.15,
            height=0.06,
            issue="Under-eye Hyperpigmentation",
            severity="Medium" if dark_circles_score > 30 else "Low",
            confidence=round(random.uniform(0.82, 0.96), 2)
        ),
        FaceRegion(
            label="Dark Circles",
            x=0.57,
            y=0.36,
            width=0.15,
            height=0.06,
            issue="Under-eye Hyperpigmentation",
            severity="Medium" if dark_circles_score > 30 else "Low",
            confidence=round(random.uniform(0.82, 0.96), 2)
        ),
        FaceRegion(
            label="Mild Redness",
            x=0.62,
            y=0.52,
            width=0.12,
            height=0.12,
            issue="Redness/Inflammation",
            severity="Low",
            confidence=round(random.uniform(0.72, 0.88), 2)
        )
    ]
    
    # If wrinkles score is high, add a forehead wrinkle detection region
    if wrinkle_score > 12:
        regions.append(FaceRegion(
            label="Forehead Lines",
            x=0.35,
            y=0.18,
            width=0.30,
            height=0.07,
            issue="Fine Wrinkles",
            severity="Low",
            confidence=round(random.uniform(0.80, 0.92), 2)
        ))

    # 4. Generate morning & night routines tailored to skin type
    if skin_type == "Oily":
        morning_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Clear sebum and pores", active_ingredient="Salicylic Acid (2%)"),
            RoutineStep(step=2, product_type="Toner", purpose="Clarify skin and tighten pores", active_ingredient="Niacinamide"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Lightweight hydration", active_ingredient="Hyaluronic Gel Cream"),
            RoutineStep(step=4, product_type="Sunscreen", purpose="Broad spectrum UV shield", active_ingredient="Zinc Oxide SPF 50")
        ]
        night_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Deep double cleanse", active_ingredient="Salicylic Acid Cleanser"),
            RoutineStep(step=2, product_type="Serum", purpose="Control oil and reduce spots", active_ingredient="Niacinamide (10%) + Zinc PCA"),
            RoutineStep(step=3, product_type="Spot Treatment", purpose="Dry active blemishes", active_ingredient="Salicylic Acid Gel"),
            RoutineStep(step=4, product_type="Moisturizer", purpose="Rebuild skin barrier overnight", active_ingredient="Ceramide Gel")
        ]
        recommended_ingredients = ["Salicylic Acid", "Niacinamide", "Zinc PCA", "Tea Tree Oil"]
    elif skin_type == "Dry":
        morning_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Hydrating non-foaming wash", active_ingredient="Glycerin & Ceramides"),
            RoutineStep(step=2, product_type="Serum", purpose="Intense hydration boost", active_ingredient="Pure Hyaluronic Acid (2%)"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Lock in deep moisture", active_ingredient="Shea Butter Cream"),
            RoutineStep(step=4, product_type="Sunscreen", purpose="Hydrating sunscreen", active_ingredient="Titanium Dioxide SPF 50")
        ]
        night_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Remove makeup & impurities", active_ingredient="Hydrating Milk Cleanser"),
            RoutineStep(step=2, product_type="Serum", purpose="Antioxidant barrier protection", active_ingredient="Vitamin E & Squalane"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Deep overnight hydration", active_ingredient="Hyaluronic Night Cream"),
            RoutineStep(step=4, product_type="Face Oil", purpose="Seal moisture barrier", active_ingredient="Organic Squalane Oil")
        ]
        recommended_ingredients = ["Hyaluronic Acid", "Ceramides", "Glycerin", "Squalane"]
    elif skin_type == "Sensitive":
        morning_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Gentle pH-balanced wash", active_ingredient="Centella Asiatica"),
            RoutineStep(step=2, product_type="Serum", purpose="Calm active redness", active_ingredient="Niacinamide (5%)"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Soothing protective layer", active_ingredient="Centella Calming Gel"),
            RoutineStep(step=4, product_type="Sunscreen", purpose="Gentle mineral UV shield", active_ingredient="Zinc Oxide SPF 50")
        ]
        night_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Cleanse skin gently", active_ingredient="Centella Cleansing Gel"),
            RoutineStep(step=2, product_type="Serum", purpose="Repair fragile skin barrier", active_ingredient="Panthenol + Ceramides"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Deep overnight recovery", active_ingredient="Soothing Barrier Cream")
        ]
        recommended_ingredients = ["Niacinamide", "Centella Asiatica", "Ceramides", "Panthenol"]
    else:  # Combination
        morning_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Balanced gel cleanse", active_ingredient="Glycerin & Fruit Extracts"),
            RoutineStep(step=2, product_type="Serum", purpose="Antioxidant glow", active_ingredient="Vitamin C (10%)"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Balanced oil-free hydration", active_ingredient="Hyaluronic Acid Gel"),
            RoutineStep(step=4, product_type="Sunscreen", purpose="Light SPF barrier", active_ingredient="Chemical Sunscreen SPF 50")
        ]
        night_steps = [
            RoutineStep(step=1, product_type="Cleanser", purpose="Cleanse impurities", active_ingredient="Gel Cleanser"),
            RoutineStep(step=2, product_type="Serum", purpose="Nightly cell turnover", active_ingredient="Retinol (0.2%)"),
            RoutineStep(step=3, product_type="Moisturizer", purpose="Replenish hydration", active_ingredient="Lightweight Ceramide Lotion")
        ]
        recommended_ingredients = ["Vitamin C", "Hyaluronic Acid", "Retinol", "Ceramides"]

    # 5. Weather suggestions
    weather_options = [
        "High humidity detected in your local area. Your skin is prone to excess sebum. Focus on lightweight, gel-based moisturizers and oil control.",
        "Dry climate alert. Atmospheric humidity is low. Boost your skin hydration with an extra layer of Hyaluronic Acid and use a rich, barrier-sealing cream.",
        "High UV Index forecasted today. Sun exposure risk is elevated. Ensure you apply a generous amount of Mineral SPF 50 and reapply every 2 hours.",
        "Cool wind chill and lower temperatures. High risk of skin chapping. Safeguard your moisture barrier with Ceramides and a soothing overnight mask."
    ]
    selected_weather_tip = random.choice(weather_options)

    # 6. Tips
    diet_tips = [
        "Hydrate: Drink at least 8-10 glasses of water daily to support cellular detoxification.",
        "Antioxidant Boost: Eat dark berries, spinach, and walnuts to combat oxidative stress.",
        "Reduce Sugar: Keep high-glycemic foods and processed sugars low to prevent insulin spikes that trigger acne."
    ]
    
    lifestyle_tips = [
        "Sleep: Get 7-8 hours of sound sleep daily. This is when your skin goes into deep healing and repair mode.",
        "Pillowcases: Wash your pillowcases twice a week in unscented detergent to prevent bacteria buildup.",
        "Exercise: 30 minutes of cardio boosts blood circulation, delivering essential nutrients to your dermal layers."
    ]

    # Save report
    report_data = {
        "user_id": current_user["id"],
        "overall_score": overall_score,
        "metrics": {
            "acne": acne_score,
            "wrinkles": wrinkle_score,
            "dark_circles": dark_circles_score,
            "pigmentation": pigmentation_score,
            "redness": redness_score,
            "oiliness": oiliness,
            "dryness": dryness
        },
        "regions": [r.dict() for r in regions],
        "routine": {
            "morning": [s.dict() for s in morning_steps],
            "night": [s.dict() for s in night_steps]
        },
        "recommended_ingredients": recommended_ingredients,
        "diet_tips": diet_tips,
        "lifestyle_tips": lifestyle_tips,
        "weather_suggestion": selected_weather_tip,
        "face_image": base64_image,
        "created_at": datetime.utcnow().isoformat()
    }
    
    saved_report = db.insert("skin_reports", report_data)
    saved_report["id"] = saved_report.get("id") or str(saved_report.get("_id"))
    return saved_report

@router.get("/reports/history", response_model=List[SkinReportResponse])
def get_reports_history(current_user: dict = Depends(get_current_user)):
    """Retrieves all previous skin reports for the logged in user to show a progress timeline."""
    reports = db.find_all("skin_reports", {"user_id": current_user["id"]})
    # Sort reports by created_at in descending order
    reports.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return reports
