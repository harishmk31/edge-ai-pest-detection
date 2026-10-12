# AgriVision AI — System Architecture

AgriVision AI is an end-to-end, edge-ready agricultural computer vision web platform designed for accurate crop pest localization, confidence estimation, and evidence-conscious agronomic field guidance.

```
                              AgriVision AI System Topology
                              
    +-------------------------------------------------------------------------+
    |                     Client Layer (React 18 + TypeScript)                |
    |  - Tailwind CSS Agricultural Design Tokens (Forest Green / Warm Sand)   |
    |  - HTML5 Live Camera Capture & Drag-and-Drop Image Normalization        |
    |  - Interactive Bounding Box Overlay Canvas & Inspection Viewer          |
    |  - Pages: Landing, AI Diagnosis, 102 Pest Library, Audit History, Guide |
    +------------------------------------+------------------------------------+
                                         | REST HTTP/JSON (Port 5173 -> 8000)
                                         v
    +-------------------------------------------------------------------------+
    |                     Backend API Layer (FastAPI 0.115)                   |
    |  - Asynchronous Request Processing & Pydantic v2 Schema Validation      |
    |  - Endpoints:                                                           |
    |      * GET  /health             (Runtime & DB Health Diagnostics)       |
    |      * GET  /api/v1/model-info  (Loaded Checkpoint & 102 Classes)       |
    |      * POST /api/v1/diagnose    (Image Ingestion & Localization)        |
    |      * GET  /api/v1/pests       (IP102 Benchmark Taxonomy & Biology)    |
    |      * GET  /api/v1/history     (Audit Log & Scanned Images)            |
    +-------------------+------------------------------------+----------------+
                        |                                    |
                        v In-Memory Inference                v Persistence
    +------------------------------------+   +--------------------------------+
    |       AI Inference Service         |   |         Storage Service        |
    | - PyTorch (CUDA Acceleration)      |   | - Images saved to disk         |
    | - Fine-Tuned YOLO11 Checkpoint     |   |   (uploads/images, annotated)  |
    | - RGB Channel Normalization        |   | - MongoDB Atlas Driver         |
    | - EXIF Orientation Correction      |   |   (Remote Cloud DB Cluster)    |
    | - Transparent RGBA Compositing     |   | - Graceful Local JSON Mode     |
    | - Bounding Box & Area Filtering    |   |   (Automatic offline fallback) |
    +------------------------------------+   +--------------------------------+
```

## 1. AI Inference Pipeline & Color Correction

Prior to this implementation, raw RGB NumPy arrays were directly passed to `model.predict()`, causing Ultralytics' loader to treat them as OpenCV BGR arrays and reverse the channels, leading to inverted color inputs. 

In AgriVision AI:
1. **EXIF Normalization**: `PIL.ImageOps.exif_transpose` ensures photos taken with smartphone cameras in portrait or landscape orientations are physically oriented right-side up.
2. **Channel Normalization**: RGBA images (PNGs with alpha channels) are composited over a pure white background to prevent alpha transparency corruption.
3. **Corrected Color Delivery**: Images are provided directly as normalized PIL RGB images to Ultralytics or converted via OpenCV to BGR if NumPy arrays are used, ensuring the underlying PyTorch tensor strictly receives proper RGB channels.

## 2. Decoupled Storage Layer

To avoid bloating databases with massive image binaries:
- Raw and annotated images are stored on disk under `uploads/images/{id}.jpg` and `uploads/annotated/{id}.jpg`.
- Structured metadata, detection bounding box arrays, confidence scores, and timestamps are persisted to **MongoDB Atlas**.
- If MongoDB credentials are not provided or the network is offline, the system switches to **Local Development Storage Mode** (`uploads/local_history.json`), logging a clear diagnostic message.
