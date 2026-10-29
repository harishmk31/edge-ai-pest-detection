# 🌿 AgriVision AI — Core Application

This folder contains the complete source code and runtime configurations for the **AgriVision AI** agricultural pest detection web platform.

## Directory Layout

- `backend/`: FastAPI REST API server (Python 3.11), asynchronous endpoint handlers, YOLO11 inference service, Kural RAG service, ICAR/TNAU agronomic catalog, and automated pytest suites.
- `frontend/`: React 18 + Vite web client (TypeScript, Tailwind CSS), interactive canvas viewer, live camera capture, multi-language localization (EN, TA, HI), and user authentication modals.
- `docs/`: Technical notes on architecture, model baselines, and database configuration.
- `uploads/`: Local directory for uploaded field photographs, annotated bounding box outputs, and offline fallback audit logs.
- `run_dev.ps1`: One-click PowerShell launcher that starts both backend and frontend development servers.
- `.env.example`: Template configuration file with placeholder values.

## Quick Start

### 1. Launch with One-Click Script (Windows)

From this `Project/` directory (or from the repository root):

```powershell
.\run_dev.ps1
```

This launches:
- **FastAPI Backend**: `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`)
- **React Frontend**: `http://localhost:5173`

---

### 2. Manual Startup

**Terminal 1 — Backend:**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

---

### 3. Running Automated Tests

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest tests -v
```
*(All 51 automated unit and integration tests passing).*
