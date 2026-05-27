from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from app.database import db
from app.schemas import ProductResponse, OrderRequest, OrderResponse, Review
from app.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter(tags=["E-Commerce Store"])

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Filter products by category"),
    skin_type: Optional[str] = Query(None, description="Filter products by skin type"),
    search: Optional[str] = Query(None, description="Search products by name or ingredients")
):
    """Retrieve all products in the store with optional category, skin type, and search queries."""
    products = db.find_all("products")
    
    filtered_products = []
    for prod in products:
        # Category Filter
        if category and prod.get("category", "").lower() != category.lower():
            continue
            
        # Skin Type Filter
        if skin_type and skin_type.lower() != "all" and prod.get("skin_type", "").lower() != "all" and prod.get("skin_type", "").lower() != skin_type.lower():
            continue
            
        # Search Filter (Checks brand, name, and ingredients)
        if search:
            search_lower = search.lower()
            in_name = search_lower in prod.get("name", "").lower()
            in_brand = search_lower in prod.get("brand", "").lower()
            in_ingredients = any(search_lower in ing.lower() for ing in prod.get("ingredients", []))
            if not (in_name or in_brand or in_ingredients):
                continue
                
        # Inject empty reviews list if missing
        if "reviews" not in prod:
            prod["reviews"] = []
        filtered_products.append(prod)
        
    return filtered_products

@router.get("/products/recommend", response_model=List[ProductResponse])
def recommend_products(current_user: dict = Depends(get_current_user)):
    """
    Personalized product recommendations based on the user's latest skin scan report.
    Matches products targeted for the user's skin type (Dry, Oily, Sensitive, Combination).
    """
    user_skin_type = current_user.get("skin_type")
    
    # If user hasn't scanned yet, find their latest scan report
    if not user_skin_type:
        latest_report = db.find_all("skin_reports", {"user_id": current_user["id"]})
        if latest_report:
            # Sort by date
            latest_report.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            metrics = latest_report[0].get("metrics", {})
            oiliness = metrics.get("oiliness", 50)
            dryness = metrics.get("dryness", 50)
            redness = metrics.get("redness", 20)
            
            if oiliness > 65:
                user_skin_type = "Oily"
            elif dryness > 60:
                user_skin_type = "Dry"
            elif redness > 25:
                user_skin_type = "Sensitive"
            else:
                user_skin_type = "Combination"
                
    # Default fallback if no scan is present
    if not user_skin_type:
        user_skin_type = "All"
        
    all_products = db.find_all("products")
    recommendations = []
    
    for prod in all_products:
        # Match product skin type with user skin type
        prod_skin = prod.get("skin_type", "").lower()
        if prod_skin == "all" or prod_skin == user_skin_type.lower() or user_skin_type.lower() == "all":
            recommendations.append(prod)
            
    # Cap recommendations at 4 products
    return recommendations[:4]

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_details(product_id: str):
    """Retrieve detailed metadata and user reviews for a specific skincare product."""
    product = db.find_one("products", {"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Lazy load mock reviews if not already seeded
    if "reviews" not in product or not product["reviews"]:
        product["reviews"] = [
            {
                "username": "Sarah K.",
                "rating": 5.0,
                "comment": "Absolutely saved my skin! Within a week, my skin felt completely hydrated and bouncy.",
                "created_at": (datetime.utcnow()).isoformat()
            },
            {
                "username": "Michael T.",
                "rating": 4.5,
                "comment": "Very lightweight, works exceptionally well under makeup. Recommending to all my friends.",
                "created_at": (datetime.utcnow()).isoformat()
            }
        ]
        db.update_one("products", {"id": product_id}, {"reviews": product["reviews"]})
        
    return product

@router.post("/products/{product_id}/review", response_model=ProductResponse)
def add_product_review(product_id: str, review: Review, current_user: dict = Depends(get_current_user)):
    """Add a customer review and rating to a product and re-calculate overall rating."""
    product = db.find_one("products", {"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    reviews = product.get("reviews", [])
    # Append the new review, setting username to user's full name
    new_rev = review.dict()
    new_rev["username"] = current_user["full_name"]
    reviews.append(new_rev)
    
    # Calculate new average rating
    total_rating = sum(r["rating"] for r in reviews)
    new_rating = round(total_rating / len(reviews), 1)
    
    db.update_one("products", {"id": product_id}, {
        "reviews": reviews,
        "rating": new_rating,
        "reviews_count": len(reviews)
    })
    
    product.update({
        "reviews": reviews,
        "rating": new_rating,
        "reviews_count": len(reviews)
    })
    return product

@router.post("/orders", response_model=OrderResponse)
def place_order(order_req: OrderRequest, current_user: dict = Depends(get_current_user)):
    """Creates a simulated store checkout order, calculating totals, and saving in orders history."""
    if not order_req.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order. Cart is empty.")
        
    ordered_items = []
    total_amount = 0.0
    
    for item in order_req.items:
        product = db.find_one("products", {"id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        item_total = product["price"] * item.quantity
        total_amount += item_total
        ordered_items.append({
            "product_id": product["id"],
            "name": product["name"],
            "brand": product["brand"],
            "price": product["price"],
            "image_url": product["image_url"],
            "quantity": item.quantity,
            "subtotal": item_total
        })
        
    # Generate mock order
    order_data = {
        "id": f"ord_{uuid.uuid4().hex[:8]}",
        "user_id": current_user["id"],
        "items": ordered_items,
        "total_amount": round(total_amount, 2),
        "status": "Processing",
        "shipping_address": order_req.shipping_address,
        "payment_method": order_req.payment_method,
        "created_at": datetime.utcnow().isoformat()
    }
    
    saved_order = db.insert("orders", order_data)
    
    # Create notification for successful checkout
    db.insert("notifications", {
        "user_id": current_user["id"],
        "title": "Order Placed Successfully",
        "message": f"Your order #{order_data['id']} of ₹{order_data['total_amount']} has been confirmed and is being processed.",
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    })
    
    return saved_order

@router.get("/orders/history", response_model=List[OrderResponse])
def get_orders_history(current_user: dict = Depends(get_current_user)):
    """Retrieves all past orders submitted by the logged in user."""
    orders = db.find_all("orders", {"user_id": current_user["id"]})
    orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return orders
