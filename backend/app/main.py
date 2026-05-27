from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, skin, products, appointments, chat, admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SkinSense AI - Complete production-ready back-end services for automated face skincare diagnostics, calendar scheduling, chatbot assistant, and e-commerce."
)

# Configure CORS Middleware
# Allows frontend development server (e.g. http://localhost:5173 or Next.js http://localhost:3000) to safely make API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains like ["https://skinsense.ai"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(auth.router)
app.include_router(skin.router)
app.include_router(products.router)
app.include_router(appointments.router)
app.include_router(chat.router)
app.include_router(admin.router)

@app.get("/google-maps-key")
def get_google_maps_key():
    return {"key": settings.GOOGLE_MAPS_API_KEY}

# Production Consolidated SPA Hosting
# Checks if the compiled frontend exists (either copied locally or in dev sibling folder)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for local static directory (used in Docker/Production builds)
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    # Fallback to dev workspace directory tree
    static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")

if os.path.exists(static_dir):
    print(f"Production static mount detected. Serving React web assets from: {static_dir}")
    # Mount assets folder for static scripts and CSS
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    # Catch-all route to serve index.html for any frontend SPA sub-pages (Dashboard, Store, etc.)
    @app.get("/{catchall:path}")
    def serve_react_app(catchall: str):
        # Allow API endpoints to fall through (FastAPI handles routers first, but this is a double check)
        if catchall.startswith(("auth/", "analyze-skin", "products", "dermatologists", "book-consultation", "reports", "orders", "chat", "admin/")):
            return None
            
        # 1. CHECK FOR ACTUAL FILES FIRST (fixes broken favicons, robots.txt, manifest.json)
        file_path = os.path.join(static_dir, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # 2. FALLBACK TO REACT ROUTER
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
            
        return {"status": "static_mount_active", "message": "React index.html missing."}
else:
    @app.get("/")
    def read_root():
        """Welcome greeting from the back-end API when static frontend is not compiled yet."""
        return {
            "status": "online",
            "message": "Welcome to the SkinSense AI Medical-Tech back-end service. Diagnostic modules online. Build frontend to mount UI at root.",
            "version": settings.PROJECT_VERSION
        }


if __name__ == "__main__":
    import uvicorn
    # Execute backend locally on port 8000 when run directly
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
