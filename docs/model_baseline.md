# AgriVision AI — Model Evaluation & Baseline Report

## 1. Checkpoint Overview

- **Checkpoint Path**: `C:\Users\Harish\Desktop\edge-ai-pest-detection\models\best.pt`
- **Architecture**: Ultralytics YOLO11 (Detection Head)
- **Training Epochs**: 50 Epochs (`pest_training-2`)
- **Dataset**: IP102 Agricultural Pest Benchmark
- **Class Count**: 102 taxonomic classes (Class 0: `rice leaf roller` ... Class 101: `Cicadellidae`)
- **Backbone Device**: CUDA GPU (`NVIDIA GeForce RTX`, `torch==2.11.0+cu128`)

### Training Epoch 50 Validation Metrics
- **Precision (B)**: 0.5149 (51.5%)
- **Recall (B)**: 0.5507 (55.1%)
- **mAP@50 (B)**: 0.5225 (52.3%)
- **mAP@50-95 (B)**: 0.3308 (33.1%)

---

## 2. Root Cause of Previous Prediction Errors

During our read-only audit of the legacy Streamlit application, we identified a critical bug in `detection.py`:

```python
# Legacy code:
image_np = np.array(image) # RGB numpy array
model.predict(source=image_np)
```

Ultralytics' `LoadPilAndNumpy` loader assumes any NumPy array provided to `predict()` is an **OpenCV BGR** array. During preprocessing, it executes `im = im[..., ::-1]` to invert BGR to RGB. Because the input was already an RGB NumPy array, the channels were inverted into BGR (swapping Red and Blue).

### Verification on Validation Benchmark Image (`ip000000008.jpg`, Ground Truth: `rice leaf roller`)

| Input Pipeline | Top Predicted Class | Confidence | False Positives | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Legacy Buggy Pipeline** (RGB NumPy array) | `rice leaf roller` | 63.7% | 1 (`rice leaf caterpillar` @ 26.0%) | Degraded & False Alarm |
| **Corrected Pipeline** (Direct PIL / Normalized RGB) | `rice leaf roller` | **81.7%** | **0** | **Clean, Exact Match** |

---

## 3. Class Diversity & Baseline Observations

| Validation Sample | Ground Truth | Corrected Inference Output | Assessment |
| :--- | :--- | :--- | :--- |
| `ip000000008.jpg` | `rice leaf roller` (0) | `rice leaf roller` (81.7%) | Accurate Localization |
| `ip000000048.jpg` | `rice leaf roller` (0) | `rice leaf roller` (69.7%) | Accurate Localization |
| `IP014000006.jpg` | `grub` (14) | `grub` (72.9%, 65.3%) | Multi-insect Detection |
| `IP024000050.jpg` | `aphids` (24) | `aphids` (60.7%) | Colony Detection |
| `IP039000018.jpg` | `cabbage army worm` (38) | `beet army worm` (65.9%) | Known Sibling Species Confusion |
| `IP007000062.jpg` | `brown plant hopper` (7) | No detection at 0.25 conf | Missed Small Target (False Negative) |
| Synthetic Grey Noise | Non-pest Negative | 0 detections | Accurate Abstention |

---

## 4. Evaluation of Candidate Models (YOLO26 vs. Existing)

An inspection of `weights/yolo26n.pt` and `yolo11n.pt` in the repository revealed they are standard 80-class COCO pretrained weights (`person`, `bicycle`, `car`, `dog`, etc.) and have **not** been trained on IP102. Replacing `best.pt` with them would destroy pest recognition capability.

**Decision**: The existing fine-tuned `best.pt` checkpoint with the color-corrected normalization pipeline is the superior, reliable model for AgriVision AI.
