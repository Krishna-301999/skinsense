---
title: SkinSense AI
emoji: 🧖‍♀️
colorFrom: indigo
colorTo: pink
sdk: docker
app_port: 8000
pinned: false
---

# SkinSense AI - Clinical Skincare Analysis & Telehealth Portal

SkinSense AI is a state-of-the-art, venture-backed clinical web application that utilizes computer vision to analyze skin conditions and diagnose treatments. The system features custom face landmark scanning, e-commerce integrations, automated skincare routine tracking, real-time climate recommendations, an AI skincare chatbot, and telehealth dermatologist video consultation.

---

## Technical Stack & Architecture

### 1. Backend (`/backend`)
*   **Core API Framework**: FastAPI (Python 3.12)
*   **Database Management**: MongoDB (PyMongo) with a **Seamless local JSON database fallback** (`backend/local_db.json`) for zero-configuration, instant local execution.
*   **Authentication & Security**: self-contained JWT validation with bcrypt secure password hashing.
*   **Image Diagnostics Engine**: Pillow-backed coordinate landmark simulation.

### 2. Frontend (`/frontend`)
*   **Core UI Engine**: React (Vite compilation framework)
*   **Styling Engine**: Tailwind CSS with custom medical-tech glassmorphism and pulsing laser animation classes.
*   **Clinical Elements**:
    *   **HTML5 Webcam Canvas Overlays**: Center-cropping overlays that plot localized coordinates (cheek breakouts, eye dark circles) with accuracy metrics directly on the portrait photo.
    *   **Clinical Before vs After**: Custom double-clipped dragging visualizer.
    *   **Contextual Weather suggestion**: Reads localized thermal metrics to suggest daily hydration boosts or UV SPF blocks.
    *   **Simulated WebRTC Call Room**: A high-fidelity Agora simulator pulling a live local patient camera stream next to an animated doctor diagnostic view with toggles, chats, and prescriptions boards.

---

## Workspace Directory Tree

```
workspace-root/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Login, /signup, user session seeding
│   │   │   ├── skin.py         # AI face mapping, routine generation
│   │   │   ├── products.py     # Product search, recommendation engine
│   │   │   ├── appointments.py # Appointment calendars, WebRTC sessions
│   │   │   ├── chat.py         # Clinical chatbot messaging logic
│   │   │   └── admin.py        # Statistics summaries and audit charts
│   │   ├── __init__.py
│   │   ├── config.py           # JWT constants, database URIs
│   │   ├── database.py         # PyMongo / Fallback Local DB helper
│   │   ├── schemas.py          # Pydantic input/output validators
│   │   ├── auth.py             # Bcrypt hashing & dependencies
│   │   └── main.py             # Core FastAPI initialization & CORS config
│   ├── local_db.json           # Persistent fallback local DB (Auto-generated)
│   ├── run.py                  # Convenience backend server launcher
│   └── requirements.txt        # Python package requirements
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Navigation sidebar & responsive dock
│   │   │   ├── SkincareChatbot.jsx # Floating clinic bot and in-chat shopping
│   │   │   ├── BeforeAfterSlider.jsx # Comparison slide tool
│   │   │   └── WeatherWidget.jsx # Contextual climate suggestions
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Startup-level home presentation
│   │   │   ├── Login.jsx       # Tabbed auth forms and quick credentials
│   │   │   ├── Dashboard.jsx   # Clinical indicators and SVG SVG charts
│   │   │   ├── Scanner.jsx     # Webcam bindings & laser scanners
│   │   │   ├── Results.jsx     # Localized overlays, routines, and PDF export
│   │   │   ├── Store.jsx       # Shopping catalog & cart drawers
│   │   │   ├── Consultation.jsx # Schedules & active WebRTC overlays
│   │   │   └── Admin.jsx       # Aggregated stats, SVG charts & audit lists
│   │   ├── App.jsx             # Router contexts, cart managers
│   │   ├── main.jsx            # DOM mounting
│   │   └── index.css           # Tailwind custom keyframes
│   ├── index.html              # HTML entry & pre-loaded Outfit fonts
│   ├── tailwind.config.js      # Palette extension and dark mode setup
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json            # Node developer tools configurations
└── README.md                   # Administrative workspace guide
```

---

## Verification & Execution Guide

Ensure you have **Python 3.10+** and **Node.js 18+** installed in your OS environment.

### Step 1: Run the FastAPI Back-End
1.  Open your command shell and navigate to the backend directory:
    ```powershell
    cd backend
    ```
2.  Install Python package dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
3.  Boot the API server locally:
    ```powershell
    python run.py
    ```
    *The console will initialize the database layer. If MongoDB is not running locally or missing in env, it will display a notification and fall back to `local_db.json`. Standard diagnostics endpoints will spin up on **`http://127.0.0.1:8000`**.*
    *Interactive OpenAPI Docs are automatically hosted at: **`http://127.0.0.1:8000/docs`***

### Step 2: Run the React Front-End
1.  Open a second command shell and navigate to the frontend directory:
    ```powershell
    cd frontend
    ```
2.  Install Node developer tool requirements:
    ```powershell
    npm install
    ```
3.  Launch the hot-module-replacement server:
    ```powershell
    npm run dev
    ```
    *Vite will compile files and launch the portal on **`http://localhost:3000`**.*

---

## Dual-Mode Fallback & Test Accounts

We engineered a **hybrid backend database client**. If no MongoDB URI is passed in your system variables, the app writes all sessions, schedules, orders, and diagnostic logs into `backend/local_db.json`. 

To enable immediate, out-of-the-box local testing, we have pre-seeded the database with two active testing accounts:
*   **Standard Patient Account**:
    *   *Email*: `user@skinsense.ai`
    *   *Password*: `user123`
*   **Board-Certified Administrator Account**:
    *   *Email*: `admin@skinsense.ai`
    *   *Password*: `admin123`

---

## Central API Endpoints Sheet

*   **`POST /auth/signup`**: Standard patient profile signup.
*   **`POST /auth/login-json`**: JSON-based JWT security session sign in.
*   **`GET /auth/me`**: Fetches active authenticated patient session.
*   **`POST /analyze-skin`**: Uploads image binary payloads and resolves coordinate markings.
*   **`GET /reports/history`**: Lists timeline files of a specific patient.
*   **`GET /products`**: Crawls e-commerce grid with optional parameters.
*   **`GET /products/recommend`**: Personalizes clinical item matrices.
*   **`POST /orders`**: Consolidates checkout shopping bags.
*   **`POST /book-consultation`**: Schedules virtual telehealth appointments.
*   **`POST /chat`**: AI Skincare assistant conversational endpoint.
*   **`GET /admin/dashboard`**: Protected aggregate administrator telemetry dashboard.
