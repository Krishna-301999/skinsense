# ==========================================
# STAGE 1: Build the React static frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

# Copy npm dependencies configs and install
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install --legacy-peer-deps

# Copy all source frontend code
COPY frontend/ ./

# Compile Tailwind CSS and React assets to /frontend/dist
RUN npm run build

# ==========================================
# STAGE 2: Package the FastAPI production server
# ==========================================
FROM python:3.12-slim
WORKDIR /backend

# Set environment paths
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source backend code
COPY backend/ ./

# Copy compiled frontend dist assets from Stage 1 into the backend's static directory
COPY --from=frontend-builder /frontend/dist /backend/static

# Expose backend port 8000
EXPOSE 8000

# Set environment variable defaults
ENV JWT_SECRET=production_clinical_secure_key_skinsense_9921c
ENV PORT=8000

# Boot consolidated FastAPI + React application on port 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
