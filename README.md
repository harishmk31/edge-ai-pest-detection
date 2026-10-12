# 🌿 AgriVision AI — Production Agricultural Pest Detection

AgriVision AI is an intelligent agricultural computer vision platform designed to detect, localize, and classify crop pests across 102 species from the IP102 benchmark.

Built for agronomists, field scouts, and farm collectives, the platform couples real-time on-device YOLO object detection with evidence-conscious field scouting guidance, MongoDB persistence, and a modern React interface.

---

## Key Highlights

- **102 Taxonomic Classes**: Full IP102 pest dataset support covering foliage caterpillars, stem borers, hoppers, aphids, beetles, mites, and flies.
- **Color-Corrected Neural Pipeline**: Completely resolves the RGB/BGR channel inversion issue identified in legacy Streamlit code. Automatically normalizes mobile EXIF rotation, alpha channels, and image dimensions.
- **Calibrated Detector Confidence**: Model confidence is presented transparently as visual pattern similarity rather than infallible truth, accompanied by scouting checklists and economic threshold guidance.
- **FastAPI Backend (Python 3.11)**: Async REST API with Pydantic v2 schemas, in-memory model caching, and static image serving.
- **MongoDB Atlas Integration**: Cloud persistence for audit logs and diagnosis history with an automated local JSON fallback for offline development.
- **Modern React 18 + Vite UI**: Styled with Tailwind CSS in an agricultural design palette (Forest Green, Warm Sand, Fresh Lime). Features drag-and-drop upload, HTML5 camera capture, and an interactive bounding box canvas.

---

## Project Structure

```text
Agrivision Ai Web/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST endpoints (/diagnose, /pests, /history, /model-info)
│   │   ├── core/           # Configuration & environment variables
│   │   ├── data/           # IP102 102-class metadata catalog & symptoms
│   │   ├── db/             # MongoDB Atlas client & offline fallback
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   ├── services/       # AI inference service, image utils & storage
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # 28 automated pytest unit and E2E tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ImageAnnotator, CameraModal, ConfidenceBadge
│   │   ├── pages/          # Landing, AI Diagnosis, Pest Library, History, Field Guide
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript interface definitions
│   └── package.json
├── docs/                   # Architecture, model baseline, and MongoDB setup docs
├── .env.example            # Environment template
├── run_dev.ps1             # One-click PowerShell server launcher
└── README.md
```

---

## Quickstart Guide

### 1. Backend Setup

From `C:\Users\Harish\Desktop\Agrivision Ai Web\backend`:

```powershell
# Activate dedicated backend virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run backend automated test suite (28 tests)
pytest tests -v

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 2. Frontend Setup

From `C:\Users\Harish\Desktop\Agrivision Ai Web\frontend`:

```powershell
# Install frontend dependencies
npm install

# Run Vite dev server
npm run dev

# Or build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. One-Click Launcher

You can start both servers simultaneously using the provided PowerShell script from the project root:

```powershell
.\run_dev.ps1
```

---

## REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API, model, and database connectivity health check |
| `GET` | `/api/v1/model-info` | Loaded YOLO checkpoint metadata and class list |
| `POST` | `/api/v1/diagnose` | Ingest image, run color-corrected YOLO, save record |
| `GET` | `/api/v1/pests` | Search and list 102 supported pest species |
| `GET` | `/api/v1/pests/{id}` | Detailed biology, visible symptoms, and host crops |
| `GET` | `/api/v1/history` | Retrieve stored diagnosis records and thumbnails |

---

## Verification & Test Results

The backend includes 28 automated tests covering:
- Image normalization, RGBA alpha compositing, EXIF rotation, and corrupted file rejection
- 102-class mapping and search algorithms
- Inference on validation images (`ip000000008.jpg` -> `Rice leaf roller` at 81.7% confidence)
- Rejection/abstention on non-pest negative images (clean crop / synthetic grey)
- Full end-to-end diagnosis flow with persistent history logging

Run the test suite anytime:
```powershell
& .\backend\.venv\Scripts\pytest.exe .\backend\tests -v
```

---

## Hackathon Demonstration Tips

1. **Live Camera Capture**: Click "Live Camera Snapshot" on the AI Diagnosis page to demonstrate camera input.
2. **Confidence Sensitivity**: Adjust the confidence slider from 10% to 80% to show how detection sensitivity behaves on different crop foliage scenes.
3. **Layer Toggle**: In the result viewer, switch between the **Annotated** bounding box overlay and the **Original Photo** to inspect insect morphology.
4. **Offline Resilience**: Notice that the top navbar seamlessly indicates whether MongoDB Atlas or local development storage is active.
