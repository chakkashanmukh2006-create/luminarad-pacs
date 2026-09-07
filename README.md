# LuminaRad PACS 🫁⚡

> **Clinical-Grade DICOM Radiology Workstation with Deep Learning Anomaly Detection, 5-Year Organ Health Prognostic Forecasting, and Interactive Kaggle AI Training Studio.**

[![Repository](https://img.shields.io/badge/GitHub-luminarad--pacs-cyan?logo=github)](https://github.com/chakkashanmukh2006-create/luminarad-pacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)

---

## 🌟 Key Features

### 1. 🩻 Clinical DICOM Workstation Viewport
- **High-Performance Medical Canvas**: Hardware-accelerated radiological viewer capable of rendering high-resolution chest and leg X-rays.
- **Window/Level (HU) Presets**: Instant switching between:
  - **Standard**: WL 40 / WW 350
  - **Lung Window**: WL -600 / WW 1500 (alveolar and bronchovascular tree inspection)
  - **Bone Window**: WL 450 / WW 2200 (cortical fracture visualization)
  - **Soft Tissue**: WL 50 / WW 400
- **True DICOM 4-Corner HUD**: Live overlay with Patient ID, Name, Age/Sex, KVp, mA, Exposure time ms, Pixel Spacing, Zoom %, and live cursor Hounsfield Unit (HU) estimation.
- **Digital Caliper Tool**: Click and drag to measure lesion diameters and fracture displacements calibrated against real DICOM `pixelSpacing` in millimeters ($mm$).
- **Grayscale Inversion**: Smooth positive/negative film toggle (`MONOCHROME1` / `MONOCHROME2`).

### 2. 🧠 Deep Learning Anomaly & Cancer Detection
- **Grad-CAM Thermal Heatmap Overlay**: Live multi-stop Jet/Turbo thermal gradient overlay highlighting exact regions of pathological activation (e.g. solitary pulmonary adenocarcinoma in right upper lobe, cortical bone fracture lines, cardiomegaly).
- **Spatial Bounding Boxes & Pathology Tags**: Pulsing bounding boxes indicating anomaly boundaries, confidence percentages ($97.4\%$), RECIST lesion volume ($cm^3$), and mean density ($HU$).
- **Multi-Label Pathology Classification**: Real-time classification bars across multiple conditions (Malignant Nodule, Consolidation, Pleural Effusion, Bone Fractures, Cardiomegaly).

### 3. 📈 5-Year Organ Health & Prognostic Trajectory Engine
- **Biological Organ Age vs Chronological Age**: Measures accelerated cellular and structural organ aging (e.g. Lung Biological Age: $71\text{ yrs}$ vs Chronological: $54\text{ yrs}$ due to malignant tissue burden).
- **Interactive 5-Year Trajectory Curve**: Canvas-rendered dual-curve comparing:
  - *Baseline Unmanaged Natural History* (decline to $22\%$ at Year 5)
  - *Interventional Recovery Trajectory* (elevates to $74\text{--}89\%$ at Year 5)
- **Clinical Treatment & Lifestyle Simulator**: Interactive toggles (VATS Lobectomy, Targeted Immunotherapy, Smoking Cessation, Locked ORIF Plating, Quadruple GDMT) that dynamically recalculate 5-year survival probability and biological age in real time!

### 4. 🔬 Mandatory AI Model Training Console (Kaggle Studio)
- **Real-World Kaggle Medical Datasets**:
  - `NIH ChestX-ray14 Benchmark` ($112,120$ Frontal Radiographs, $30,805$ Patients)
  - `Stanford CheXpert Collection` ($224,316$ Radiographs with uncertainty labels)
  - `Stanford MURA (Musculoskeletal Radiographs)` ($40,561$ Multi-view extremity scans)
  - `RSNA Pneumonia & Lung Nodule Detection Challenge` ($30,227$ DICOM scans)
- **Hyperparameter Customization**: Select Backbone (DenseNet-121 CheXNet, ResNet-50, ViT-B/16, EfficientNet-B4), Learning Rate ($1e-4$, $5e-5$), Batch Size ($16$, $32$, $64$), Optimizer (AdamW, SGD), and Target Epochs.
- **Live Streaming Metrics & Visualizations**:
  - Dynamic dual-line **Loss Curve** (Train Loss vs Validation Loss)
  - Dynamic **ROC-AUC Diagnostic Precision** curve
  - Interactive **Validation Confusion Matrix** ($1,842\text{ TP}$, $94\text{ FP}$, $62\text{ FN}$, $8,420\text{ TN}$) with Sensitivity ($96.7\%$) and Specificity ($98.9\%$)
  - Live streaming **Terminal Log Feed** with epoch throughput ($48.2\text{ img/sec}$)
  - Checkpoint export (`.pth` / `.onnx` configuration) with celebration effects.

---

## 💻 Tech Stack

- **Frontend Core**: React 19, TypeScript 6, Vite 8
- **Styling**: Vanilla CSS Design System with Cyber-Medical Dark Mode, Glassmorphism, and Clinical HUD Tokens
- **Icons & Graphics**: `lucide-react`, HTML5 Canvas (Hardware-accelerated 2D Context), SVG Layers
- **Effects**: `canvas-confetti`

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/chakkashanmukh2006-create/luminarad-pacs.git
cd luminarad-pacs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build Production Bundle
```bash
npm run build
```

---

## 📁 Repository Structure
```
luminarad-pacs/
├── public/
│   └── samples/                   # Real clinical chest & leg radiographs
│       ├── chest_nodule_cancer.jpg
│       ├── leg_femur_fracture.jpg
│       ├── chest_cardiomegaly.jpg
│       └── chest_normal.jpg
├── src/
│   ├── components/
│   │   ├── AnalysisTabs/
│   │   │   ├── FindingsTab.tsx    # Pathology breakdown & triage
│   │   │   ├── PrognosisTab.tsx   # 5-Yr trajectory & treatment simulator
│   │   │   ├── DicomMetadataTab.tsx # DICOM tag inspector & print
│   │   │   └── TrainingConsoleTab.tsx # Kaggle training studio & live charts
│   │   ├── AnalysisPanel.tsx      # Tab container
│   │   ├── DicomViewport.tsx      # DICOM canvas, W/L, Caliper, Grad-CAM
│   │   ├── Navbar.tsx             # Header, PACS telemetry, GitHub link
│   │   └── StudySelector.tsx      # Case library & DICOM upload
│   ├── data/
│   │   ├── kaggleDatasets.ts      # Kaggle dataset specs & distributions
│   │   └── studies.ts             # Clinical cases & ground-truth annotations
│   ├── types/
│   │   └── index.ts               # Complete TypeScript data model
│   ├── App.tsx                    # Main workstation layout
│   ├── index.css                  # Modern clinical design system
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 📜 License
MIT License. Created by [shannu2006](https://github.com/chakkashanmukh2006-create).
