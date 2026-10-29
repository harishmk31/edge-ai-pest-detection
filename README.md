# 🌿 AgriVision AI — Agricultural Pest Detection & Decision Support

AgriVision AI is an edge-ready agricultural computer vision web platform that detects, localizes, and classifies crop pests across **102 insect species** from the IP102 benchmark. 

The system couples a fine-tuned **Ultralytics YOLO11n** object detection model with a **FastAPI** backend, a modern **React 18 / TypeScript** frontend, and **Kural**, a conversational agricultural AI assistant grounded in ICAR and TNAU agronomic guidance.

---

## 1. Problem Statement

Phytophagous insect pests cause 20% to 40% annual crop losses globally. In farming communities, early detection is hindered by:
- Severe visual mimicry between related species (e.g., cabbage army worm vs. beet army worm).
- Morphological polymorphism across developmental life stages (larvae, pupae, adults).
- Heavy visual clutter and occlusion in natural crop foliage.
- Shortage of trained agricultural extension specialists in rural farming areas.

These challenges frequently lead farmers to resort to preventative, broad-spectrum chemical spraying, which elevates production costs, harms beneficial insects, and contaminates agricultural ecosystems. AgriVision AI provides fast, accessible visual diagnostics and evidence-based Integrated Pest Management (IPM) recommendations.

---

## 2. Dataset & Detection Classes

AgriVision AI is trained and benchmarked on the **IP102** agricultural pest benchmark dataset:
- **Total Images:** 18,981 field photographs.
- **Annotated Bounding Boxes:** 22,289 boxes.
- **Taxonomic Coverage:** 102 species represented in the platform's knowledge catalog.
- **Detection-Annotated Classes:** Exactly 97 classes have spatial bounding boxes in the Pascal VOC detection split.
- **Evaluation Partition:** 15,178 trainval images (split into 85% train and 15% val) with an official held-out test split of **3,798 images (4,444 bounding boxes)**.

---

## 3. Deep Learning Methodology & YOLO11n Workflow

- **Architecture:** Ultralytics YOLO11 nano (`yolo11n.pt`), single-stage detector with 2.6 million parameters and a compact 5.6 MB checkpoint weight size.
- **Backbone & Neck:** C3k2 convolutional feature extractor, SPPF module, and Path Aggregation Network (PANet) fusing multi-scale feature maps ($P_3, P_4, P_5$).
- **Detection Head:** Anchor-free decoupled head predicting classification and bounding box regression coordinates independently.
- **Loss Functions:** Complete IoU (CIoU) loss for spatial alignment, Distribution Focal Loss (DFL) for boundary uncertainty, and Binary Cross-Entropy with Task-Aligned Assigner (TAL).
- **Color-Corrected Pipeline:** Eliminates legacy RGB/BGR channel inversion defects, automatically resolves smartphone EXIF orientation, and composites transparent RGBA PNGs onto neutral canvases.

### Test Partition Benchmark (3,798 Held-Out Images)

| Metric | Baseline (`best.pt`) | 20-Epoch Balanced Model |
| :--- | :---: | :---: |
| **mAP@0.50** | **54.48%** | 50.47% |
| **mAP@0.50:0.95** | **34.79%** | 31.95% |
| **Precision** | 50.97% | **51.24%** |
| **Recall** | **58.98%** | 51.84% |
| **F1-Score** | **54.68%** | 51.54% |
| **GPU Latency (RTX)** | **45.8 ms** | 51.8 ms |

---

## 4. System Architecture

```text
edge-ai-pest-detection/
├── Project/
│   ├── backend/            # FastAPI Python 3.11 REST API
│   │   ├── app/            # Endpoints, schemas, inference, RAG, auth, and data catalogs
│   │   ├── tests/          # 51 automated unit, integration, and E2E tests
│   │   └── requirements.txt
│   ├── frontend/           # React 18 + Vite + TypeScript web interface
│   │   ├── src/            # Components, pages, canvas visualizer, i18n
│   │   └── package.json
│   ├── docs/               # System architecture and model baseline documentation
│   ├── uploads/            # Uploaded and annotated images (.gitkeep)
│   ├── .env.example        # Environment variable template
│   ├── run_dev.ps1         # Windows development server launcher
│   └── README.md           # Application-level README
├── Project_Report/
│   ├── Project report.docx # Official 10-page undergraduate technical project report
│   └── README.md
├── Video_Explanation/
│   ├── README.md           # Guide for team-member presentation videos
│   └── .gitkeep
├── run_dev.ps1             # Root shortcut launcher
├── .env.example            # Root template
├── .gitignore              # Repository gitignore (protects secrets, .venv, node_modules)
└── README.md
```

### Core Application Roles
- **Frontend (React 18 + Vite):** Responsive UI styled with Tailwind CSS in an agricultural theme. Features drag-and-drop file upload, live HTML5 rear camera capture (`facingMode: "environment"`), an interactive canvas toggling between raw and annotated views, calibrated confidence badges (High $\ge 75\%$, Moderate $50\text{--}74\%$, Low $< 50\%$), and multi-language support (English, Tamil, Hindi).
- **Backend (FastAPI):** Asynchronous REST API serving predictions, species catalogs, and diagnostic history. Employs in-memory model caching, Pydantic v2 schemas, and hybrid storage (MongoDB Atlas with automatic offline fallback to local JSON audit logging).
- **Kural AI Assistant:** Conversational decision-support assistant using Retrieval-Augmented Generation (RAG) over verified ICAR and TNAU agronomic guidance. Provides structured 4-tier Integrated Pest Management (IPM) protocols and enforces strict safety guardrails refusing unauthorized chemical pesticide dosage calculations.

---

## 5. Prerequisites

- **Operating System:** Windows 10/11, Linux, or macOS
- **Python:** Version `3.11.x`
- **Node.js:** Version `18.x` or `20.x` (with `npm`)
- **GPU (Optional):** NVIDIA GPU with CUDA for accelerated inference (CPU fallback supported automatically)

---

## 6. Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/harishmk31/edge-ai-pest-detection.git
cd edge-ai-pest-detection
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the `Project/` directory:
```powershell
Copy-Item Project\.env.example Project\.env
```
Key configuration parameters:
```env
# Server
ENVIRONMENT=development
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# AI Model Checkpoint (relative to execution path or absolute)
MODEL_PATH=models/best.pt
DEFAULT_CONFIDENCE_THRESHOLD=0.35

# Storage
UPLOAD_STORAGE_DIR=./uploads

# Optional: MongoDB Atlas (leave empty for offline local JSON mode)
MONGODB_URI=
MONGODB_DB_NAME=agrivision_ai

# Optional: Kural Assistant live OpenAI-compatible LLM key (leave empty for local RAG catalog mode)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### 3. Backend Setup
```powershell
cd Project\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..\..
```

### 4. Frontend Setup
```powershell
cd Project\frontend
npm install
cd ..\..
```

---

## 7. Running the Application

### Option A: One-Click PowerShell Launcher (Windows)
From the repository root:
```powershell
.\run_dev.ps1
```
This automatically launches two terminal windows:
- **FastAPI Backend:** `http://127.0.0.1:8000` (Swagger interactive docs at `http://127.0.0.1:8000/docs`)
- **React Frontend:** `http://localhost:5173`

### Option B: Manual Execution

**Terminal 1 — Backend:**
```powershell
cd Project\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd Project\frontend
npm run dev
```

---

## 8. Running the Automated Tests

The automated test suite verifies API routes, JWT authentication, EXIF orientation correction, RGBA alpha compositing, negative sample abstention, multi-detection parsing, and Kural assistant RAG retrieval:

```powershell
cd Project\backend
.\.venv\Scripts\python.exe -m pytest tests -v
```

**Test Status:** `51 passed, 0 failed` in ~12 seconds.

To test the frontend production build:
```powershell
cd Project\frontend
npm run build
```

---

## 9. Project Deliverables

- **Project Codebase:** Located in `Project/` (`backend/` and `frontend/`).
- **Project Report:** Located in `Project_Report/Project report.docx` (concise 10-page undergraduate report).
- **Video Explanations:** Located in `Video_Explanation/` (team-member video walkthroughs).
