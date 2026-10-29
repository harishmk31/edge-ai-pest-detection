# 📄 AgriVision AI — Project Report

This directory contains the official college technical project report for the AgriVision AI platform.

## Available Documents

- **[Project report.docx](./Project%20report.docx)**: The complete, concise 10-page academic project report prepared for undergraduate B.Tech Artificial Intelligence and Data Science project evaluation.

## Report Outline

1. **Title Page**: Institutional metadata, academic year 2025–2026.
2. **Abstract**: Problem summary, IP102 dataset, YOLO11n architecture, color space fix, and Kural AI integration.
3. **Introduction**: Agricultural context, economic significance, and limitations of manual field scouting.
4. **Problem Statement and Objectives**: Life-stage polymorphism, visual mimicry, foliage occlusion, and technical objectives.
5. **Dataset Description**: IP102 benchmark analysis (18,981 images, 22,289 bounding boxes, 97 detection-annotated classes), coordinate normalization, and split isolation (85% train / 15% val / 3,798 held-out test).
6. **Proposed Deep-Learning Methodology**: YOLO11n single-stage selection, CIoU loss, Distribution Focal Loss (DFL), and Task-Aligned Assigner (TAL).
7. **YOLO11n Model and Training**: C3k2 backbone, SPPF, PANet neck, 50-epoch training progression, and loss convergence curves.
8. **Evaluation and Results**: Test partition metrics (54.48% mAP@0.50, 58.98% recall, 45.8 ms latency), baseline vs. balanced comparison, and verification of the color channel inversion bug fix (+18.0% confidence boost).
9. **System Implementation**: FastAPI backend, React 18 / TypeScript frontend, interactive inspection canvas, calibrated confidence tiers, and Kural assistant with RAG retrieval.
10. **Testing and Discussion**: Automated pytest suite verification (51 passed tests in 10.63s) and negative sample validation.
11. **Limitations and Future Improvements**: Visual vs. biological identification, occlusion on $<10\text{ px}$ insects, INT8 quantization, and drone orthomosaics.
12. **Course Outcome (CO) Mapping**: Draft 4-column mapping table aligned with standard Deep Learning curriculum competencies.
13. **Conclusion**: Project retrospective and field deployment viability.
14. **References**: Real, verified citations (IP102 CVPR 2019, Ultralytics YOLO11, ICAR, TNAU, CIBRC).
