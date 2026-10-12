# 🌿 AgriVision AI — Agricultural Pest Detection Platform

AgriVision AI is an intelligent agricultural computer vision web platform engineered to detect, localize, and classify crop pests across **102 species** from the IP102 benchmark.

Built for agronomists, agricultural extension workers, and farming collectives, the system couples real-time YOLO object detection with evidence-conscious field scouting guidance, MongoDB persistence, and a modern React interface.

---

## 🚀 Key Features

- **102 Taxonomic Classes**: Detects and localizes agricultural insect pests covering leaf folders, stem borers, hoppers, aphids, beetles, mites, and armyworms.
- **Color-Corrected Neural Pipeline**: Fully eliminates RGB/BGR channel inversion issues from legacy computer vision pipelines. Automatically resolves mobile EXIF rotation, alpha channels, and image dimensions.
- **Calibrated Detector Confidence**: Transparent confidence scoring (High $\ge 75\%$, Moderate $50\text{–}74\%$, Low $< 50\%$) accompanied by agronomic verification checklists and economic threshold guidelines.
- **Interactive Inspection Canvas**: Dual-mode visualizer supporting seamless toggling between annotated bounding box overlays and raw unedited photographs, with instant JPEG export.
- **FastAPI Backend (Python 3.11)**: High-performance asynchronous REST API with Pydantic v2 validation schemas, in-memory model caching, and static image serving.
- **Dual Persistence (MongoDB Atlas & Offline Local Fallback)**: Cloud database persistence with automated local JSON audit logging (`uploads/local_history.json`) when operating without cloud credentials.
- **Modern React 18 + Vite UI**: Styled with Tailwind CSS in an agricultural design palette (Forest Green, Warm Sand, Fresh Lime). Features drag-and-drop upload and HTML5 camera capture.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas API |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, Uvicorn |
| **AI / Computer Vision** | PyTorch 2.11+ (CUDA/CPU), Ultralytics YOLO11, Pillow, OpenCV, NumPy |
| **Database & Storage** | MongoDB Atlas (PyMongo), Local JSON Fallback, Local File Storage |
| **Testing** | Pytest (28 automated unit & E2E tests), TypeScript compiler (`tsc`) |

---

## 📋 Prerequisites

- **Operating System**: Windows 10/11 (or Linux/macOS)
- **Python**: Version `3.11.x` (64-bit recommended)
- **Node.js**: Version `18.x` or `20.x` (with `npm`)
- **GPU (Optional)**: NVIDIA GPU with CUDA 12.x for accelerated inference; CPU inference is supported automatically as fallback.

---

## ⚙️ Installation & Setup

### 1. Clone or Open the Repository
```powershell
cd "C:\Users\Harish\Desktop\Agrivision Ai Web"
```

### 2. Environment Configuration
Copy the safe template `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Edit `.env` to configure your local paths and settings:
```env
# Server Configuration
ENVIRONMENT=development
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# AI Model Configuration
# Path to your YOLO checkpoint (relative or absolute)
MODEL_PATH=models/best.pt
DEFAULT_CONFIDENCE_THRESHOLD=0.35
IMAGE_MIN_AREA_RATIO=0.001

# Storage
UPLOAD_STORAGE_DIR=./uploads

# MongoDB Atlas Configuration (Optional)
# Leave blank to run in offline local development storage mode
MONGODB_URI=
MONGODB_DB_NAME=agrivision_ai
```

### 3. Backend Setup
Set up the dedicated Python virtual environment and install dependencies:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### 4. Frontend Setup
Install frontend dependencies:
```powershell
cd frontend
npm install
cd ..
```

---

## 🧠 Model Weights Setup

Because deep learning checkpoints (`.pt`) exceed standard Git file size recommendations, model weights are excluded from this repository.

1. **Obtain the Checkpoint**:
   - Locate your trained YOLO IP102 checkpoint (`best.pt`).
2. **Place the File**:
   - Place `best.pt` in a local `models/` directory inside `Agrivision Ai Web`, or keep it in an external directory.
3. **Configure `.env`**:
   - Set `MODEL_PATH` in `.env` to the path of your checkpoint:
     ```env
     MODEL_PATH=models/best.pt
     ```
     Or use an absolute Windows path:
     ```env
     MODEL_PATH=C:\Users\Harish\Desktop\edge-ai-pest-detection\models\best.pt
     ```
   - If no checkpoint is present, the API will report `status: unavailable` gracefully on `/health` and return a clear configuration message.

---

## 🚀 Starting the Services on Windows

### Option A: One-Click PowerShell Launcher (Recommended)
From the root directory:
```powershell
.\run_dev.ps1
```
This launches two PowerShell terminal windows:
- **FastAPI Backend**: `http://127.0.0.1:8000` (Swagger docs at `/docs`)
- **Vite Frontend**: `http://localhost:5173`

---

### Option B: Manual Startup

**Terminal 1 — FastAPI Backend:**
```powershell
cd "C:\Users\Harish\Desktop\Agrivision Ai Web\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — React Frontend:**
```powershell
cd "C:\Users\Harish\Desktop\Agrivision Ai Web\frontend"
npm run dev
```

---

## 🧪 Running the Backend Tests

The test suite validates image normalization, RGBA compositing, EXIF rotation handling, class mapping, negative sample rejection, and full end-to-end diagnosis:

```powershell
cd "C:\Users\Harish\Desktop\Agrivision Ai Web\backend"
.\.venv\Scripts\python.exe -m pytest tests -v
```

*Current Test Status:* **28 passed, 0 failed** in 12.05s.

To build the frontend for production:
```powershell
cd "C:\Users\Harish\Desktop\Agrivision Ai Web\frontend"
npm run build
```

---

## 📊 Model Evaluation & Current Limitations

### Official Held-Out Test Set Performance (3,798 images, 4,444 bounding boxes)
Both the baseline YOLO11 fine-tuned checkpoint (`best.pt`) and a 20-epoch class-balanced augmented model were benchmarked on the official IP102 test partition:

| Metric | Baseline (`best.pt`) | 20-Epoch Balanced Model |
| :--- | :---: | :---: |
| **mAP@0.50** | **54.48%** | 50.47% |
| **mAP@0.50:0.95** | **34.79%** | 31.95% |
| **Precision** | 50.97% | **51.24%** |
| **Recall** | **58.98%** | 51.84% |
| **F1 Score** | **54.68%** | 51.54% |
| **GPU Latency (RTX 4070)** | **45.8 ms** | 51.8 ms |

*Rare-class gains from balancing:* Notable improvements were observed on underrepresented species, including *Chlumetia transversa* (+47.0% AP) and *Dacus dorsalis* (+23.4% AP). However, due to superior overall mAP@0.50 across all 102 classes, `best.pt` remains the default production checkpoint.

### Current Model Limitations
1. **Biological Verification**: Neural detector confidence represents visual pattern similarity, not an infallible taxonomic confirmation.
2. **Macro vs. Field Scale**: Macro photographs with centered insects achieve significantly higher recall than wide foliage shots with heavy background clutter.
3. **Small Target Occlusion**: Very small insects (e.g. young nymphs or plant hoppers $< 10\text{px}$) may be missed in dense foliage.
4. **Morphological Mimicry**: Sibling species (e.g. *cabbage army worm* vs. *beet army worm*) may exhibit cross-classification when lighting or larval instar stages vary.

---

## 📁 Repository Structure

```text
Agrivision Ai Web/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Endpoints (/diagnose, /pests, /history, /model-info)
│   │   ├── core/           # Configuration & settings
│   │   ├── data/           # 102 IP102 species catalog & agronomic metadata
│   │   ├── db/             # MongoDB Atlas client & local JSON fallback
│   │   ├── schemas/        # Pydantic v2 request/response models
│   │   ├── services/       # YOLO inference, color correction, disk storage
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # 28 automated test cases
│   ├── uploads/            # Local image upload directory (.gitkeep)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # ImageAnnotator, CameraModal, ConfidenceBadge, Navbar, Footer
│   │   ├── pages/          # DiagnosisPage, PestLibraryPage, HistoryPage, PestGuidePage
│   │   ├── services/       # Typed REST API client
│   │   └── types/          # TypeScript interface definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/                   # Architecture, MongoDB guide, model baseline notes
├── .env.example            # Safe environment template with placeholders
├── .gitignore              # Excludes weights, datasets, secrets, and caches
├── run_dev.ps1             # Windows PowerShell dual-service launcher
└── README.md
```

---

## 📄 License
Academic and research use under the IP102 benchmark license guidelines.
