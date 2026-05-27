import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config import settings

logger = logging.getLogger("skinsense.database")
logging.basicConfig(level=logging.INFO)

class DualModeDatabase:
    def __init__(self):
        self.is_mongodb = False
        self.client = None
        self.db = None
        self.local_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "local_db.json")
        self.memory_db = {
            "users": [],
            "skin_reports": [],
            "products": [],
            "appointments": [],
            "orders": [],
            "consultations": [],
            "notifications": []
        }
        
        # Load local storage if it exists
        self._load_local_db()
        
        # Try to connect to MongoDB
        if settings.MONGODB_URI:
            try:
                # 3-second connection timeout
                self.client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
                # Verify connection
                self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_mongodb = True
                logger.info("Successfully connected to MongoDB.")
                
                # Sync pre-loaded products if MongoDB collections are empty
                self._sync_products_to_mongodb()
            except (ConnectionFailure, Exception) as e:
                logger.warning(f"MongoDB connection failed: {e}. Falling back to high-fidelity local JSON database.")
                self.is_mongodb = False
        else:
            logger.info("No MongoDB URI configured. Using high-fidelity local JSON database.")
            self.is_mongodb = False

        # If collections are empty, seed products
        self._seed_default_products()

    def _load_local_db(self):
        if os.path.exists(self.local_file):
            try:
                with open(self.local_file, "r") as f:
                    data = json.load(f)
                    for key in self.memory_db:
                        if key in data:
                            self.memory_db[key] = data[key]
                logger.info(f"Loaded existing local database from {self.local_file}")
            except Exception as e:
                logger.error(f"Error reading local database file: {e}")

    def _save_local_db(self):
        if not self.is_mongodb:
            try:
                with open(self.local_file, "w") as f:
                    json.dump(self.memory_db, f, indent=4, default=str)
            except Exception as e:
                logger.error(f"Error saving local database file: {e}")

    def _seed_default_products(self):
        # We check if products are already present
        products_count = self.get_count("products")
        
        # Force re-seed for Indian localization if old USD catalog is detected
        if products_count > 0:
            first_prod = self.find_one("products", {})
            if first_prod and "HydraGlow" in first_prod.get("name", ""):
                logger.info("Outdated USD catalog detected. Re-seeding Indian localized catalog...")
                self.memory_db["products"] = []
                if self.is_mongodb:
                    try:
                        self.db["products"].delete_many({})
                    except Exception:
                        pass
                products_count = 0

        if products_count == 0:
            logger.info("Seeding Indian premium dermatologist-tested skincare products in INR...")
            default_products = [
                {
                    "id": "prod_1",
                    "name": "10% Niacinamide Face Serum",
                    "brand": "Minimalist",
                    "price": 599.0,
                    "rating": 4.8,
                    "category": "Serums",
                    "skin_type": "Sensitive",
                    "description": "Nourishing daily serum formulated with high purity Niacinamide and Zinc PCA. Reduces blemishes, heals acne marks, and controls excess oil production in hot climates.",
                    "ingredients": ["Niacinamide", "Zinc PCA", "Aloe Vera Juice", "Hyaluronic Acid"],
                    "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 142,
                    "in_stock": True
                },
                {
                    "id": "prod_2",
                    "name": "2% Salicylic Acid Face Cleanser",
                    "brand": "The Derma Co",
                    "price": 349.0,
                    "rating": 4.6,
                    "category": "Cleansers",
                    "skin_type": "Oily",
                    "description": "Sulfate-free gel face wash containing Salicylic Acid (BHA) to deeply exfoliate clogged pores, wipe off excess tropical humidity oil, and reduce active acne.",
                    "ingredients": ["Salicylic Acid (2%)", "Witch Hazel Extract", "Allantoin", "Tea Tree Oil"],
                    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 98,
                    "in_stock": True
                },
                {
                    "id": "prod_3",
                    "name": "Green Tea Pore Cleansing Face Wash",
                    "brand": "Plum Goodness",
                    "price": 299.0,
                    "rating": 4.7,
                    "category": "Cleansers",
                    "skin_type": "Combination",
                    "description": "Antioxidant-rich gentle foaming cleanser with green tea extracts and glycolic acid. Smooths skin, tightens pores, and fights urban pollution build-up in Indian cities.",
                    "ingredients": ["Green Tea Extract", "Glycolic Acid", "Glycerin", "Coconut Derivatives"],
                    "image_url": "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 115,
                    "in_stock": True
                },
                {
                    "id": "prod_4",
                    "name": "Ultra Matte Dry Touch Sunscreen SPF 50",
                    "brand": "Re'equil",
                    "price": 695.0,
                    "rating": 4.9,
                    "category": "Sunscreens",
                    "skin_type": "All",
                    "description": "Dermatologist-tested silicone-gel sunscreen providing advanced broad-spectrum UVA/UVB protection. Zero white cast, water-resistant, with an ultra-matte velvety finish suited for hot and humid summers.",
                    "ingredients": ["Zinc Oxide", "Titanium Dioxide", "Tocopheryl Acetate", "Biosaccharide Gum"],
                    "image_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 210,
                    "in_stock": True
                },
                {
                    "id": "prod_5",
                    "name": "Kumkumadi Miraculous Beauty Fluid",
                    "brand": "Kama Ayurveda",
                    "price": 1895.0,
                    "rating": 4.9,
                    "category": "Serums",
                    "skin_type": "Dry",
                    "description": "Luxurious, 100% natural Ayurvedic night serum made with pure Saffron, Sandalwood, and Vetiver. Fades dark circles, boosts natural glow, and reverses wrinkles.",
                    "ingredients": ["Saffron (Kumkuma)", "Sandalwood", "Manjistha", "Licorice Extract", "Sesame Oil"],
                    "image_url": "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 184,
                    "in_stock": True
                },
                {
                    "id": "prod_6",
                    "name": "Pure Rosewater Facial Tonic Mist",
                    "brand": "Forest Essentials",
                    "price": 450.0,
                    "rating": 4.8,
                    "category": "Moisturizers",
                    "skin_type": "Sensitive",
                    "description": "Steam-distilled pure Kannauj rose water designed to intensely hydrate, cool down summer redness, act as a natural toner, and refresh tired skin.",
                    "ingredients": ["Steam Distilled Kannauj Rose Water (100%)"],
                    "image_url": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=300&auto=format&fit=crop",
                    "reviews_count": 86,
                    "in_stock": True
                }
            ]
            
            for prod in default_products:
                self.insert("products", prod)
            logger.info("Successfully seeded localized Indian skincare products.")

    def _sync_products_to_mongodb(self):
        if self.is_mongodb:
            try:
                products_collection = self.db["products"]
                if products_collection.count_documents({}) == 0:
                    logger.info("MongoDB detected, seeding products to MongoDB...")
                    for prod in self.memory_db["products"]:
                        products_collection.insert_one(prod.copy())
            except Exception as e:
                logger.error(f"Error syncing products to MongoDB: {e}")

    # General CRUD Wrapper functions to support dual-mode seamlessly
    
    def get_count(self, collection_name: str) -> int:
        if self.is_mongodb:
            try:
                return self.db[collection_name].count_documents({})
            except Exception as e:
                logger.error(f"MongoDB count_documents error: {e}")
                return len(self.memory_db.get(collection_name, []))
        else:
            return len(self.memory_db.get(collection_name, []))

    def find_all(self, collection_name: str, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if self.is_mongodb:
            try:
                cursor = self.db[collection_name].find(query or {})
                return [dict(doc, _id=str(doc["_id"])) for doc in cursor]
            except Exception as e:
                logger.error(f"MongoDB find error: {e}")
                # Fallback to local
        
        # Local fallback/in-memory query logic
        data = self.memory_db.get(collection_name, [])
        if not query:
            return data
            
        filtered = []
        for item in data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                filtered.append(item)
        return filtered

    def find_one(self, collection_name: str, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.is_mongodb:
            try:
                doc = self.db[collection_name].find_one(query)
                if doc:
                    return dict(doc, _id=str(doc["_id"]))
                return None
            except Exception as e:
                logger.error(f"MongoDB find_one error: {e}")
                # Fallback to local
        
        data = self.memory_db.get(collection_name, [])
        for item in data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                return item
        return None

    def insert(self, collection_name: str, document: Dict[str, Any]) -> Dict[str, Any]:
        doc_copy = document.copy()
        
        # Ensure timestamp fields are serialized or set
        if "created_at" not in doc_copy:
            doc_copy["created_at"] = datetime.utcnow().isoformat()
            
        if self.is_mongodb:
            try:
                res = self.db[collection_name].insert_one(doc_copy)
                doc_copy["_id"] = str(res.inserted_id)
                return doc_copy
            except Exception as e:
                logger.error(f"MongoDB insert error: {e}")
                # Fallback to local

        # Local fallback / memory-db insertion
        # Ensure it has an id
        if "id" not in doc_copy and "_id" not in doc_copy:
            import uuid
            doc_copy["id"] = f"{collection_name[:4]}_{uuid.uuid4().hex[:8]}"
        elif "id" in doc_copy and "_id" not in doc_copy:
            doc_copy["_id"] = doc_copy["id"]
        elif "_id" in doc_copy and "id" not in doc_copy:
            doc_copy["id"] = str(doc_copy["_id"])
            
        self.memory_db[collection_name].append(doc_copy)
        self._save_local_db()
        return doc_copy

    def update_one(self, collection_name: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        if self.is_mongodb:
            try:
                res = self.db[collection_name].update_one(query, {"$set": update_data})
                return res.modified_count > 0
            except Exception as e:
                logger.error(f"MongoDB update error: {e}")
                # Fallback to local
        
        # Local fallback
        data = self.memory_db.get(collection_name, [])
        updated = False
        for item in data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                item.update(update_data)
                item["updated_at"] = datetime.utcnow().isoformat()
                updated = True
        if updated:
            self._save_local_db()
        return updated

    def delete_one(self, collection_name: str, query: Dict[str, Any]) -> bool:
        if self.is_mongodb:
            try:
                res = self.db[collection_name].delete_one(query)
                return res.deleted_count > 0
            except Exception as e:
                logger.error(f"MongoDB delete error: {e}")
                # Fallback to local

        # Local fallback
        data = self.memory_db.get(collection_name, [])
        initial_len = len(data)
        self.memory_db[collection_name] = [
            item for item in data if not all(item.get(k) == v for k, v in query.items())
        ]
        deleted = len(self.memory_db[collection_name]) < initial_len
        if deleted:
            self._save_local_db()
        return deleted

# Global single instance of our database client
db = DualModeDatabase()
