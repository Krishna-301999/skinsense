import uvicorn
import os
import sys

# Ensure backend root is on Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting SkinSense AI Backend Service...")
    print("API documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
