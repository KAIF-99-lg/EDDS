# EDDS — Project Report Information
## (Final Year Project — Complete Reference)

---

## 1. Basic Info

| Field | Details |
|---|---|
| Project Title | EDDS — Early Disease Detection System |
| Type | Web Application (Full Stack) |
| Deployment | Frontend → Vercel, Backend → Render (Docker) |
| Purpose | AI-powered medical image analysis for early disease detection |

---

## 2. Diseases Detected

| # | Disease | Input Type | Classes |
|---|---|---|---|
| 1 | Brain Tumor | MRI Image | Glioma, Meningioma, Pituitary, No Tumor |
| 2 | Breast Cancer | Ultrasound Image | Benign, Malignant, Normal |
| 3 | Pneumonia | Chest X-ray | Normal, Pneumonia |
| 4 | Skin Cancer | Dermoscopy Image | Benign, Malignant |
| 5 | Heart Disease | Clinical Form Data | Low Risk, High Risk |

---

## 3. Datasets (All from Kaggle)

| Disease | Dataset Name | Source URL |
|---|---|---|
| Brain Tumor | Brain Tumor Classification MRI | https://www.kaggle.com/datasets/sartajbhuvaji/brain-tumor-classification-mri |
| Breast Cancer | Breast Ultrasound Images Dataset | https://www.kaggle.com/datasets/aryashah2k/breast-ultrasound-images-dataset |
| Pneumonia | Chest X-Ray Images (Pneumonia) | https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia |
| Skin Cancer | Skin Cancer Malignant vs Benign | https://www.kaggle.com/datasets/fanconic/skin-cancer-malignant-vs-benign |
| Heart Disease | Heart Disease UCI | https://www.kaggle.com/datasets/ronitf/heart-disease-uci |

### Dataset Sizes (Approximate)

| Disease | Train Images | Test Images | Total |
|---|---|---|---|
| Brain Tumor | ~2,870 | ~394 | ~3,264 |
| Breast Cancer | ~624 | ~156 | ~780 |
| Pneumonia | ~5,216 | ~624 | ~5,840 |
| Skin Cancer | ~2,000 | ~500 | ~2,500 |
| Heart Disease | ~242 rows | ~61 rows | ~303 rows |

---

## 4. AI Models

### Image Models (Brain, Breast, Pneumonia, Skin)

| Property | Value |
|---|---|
| Base Architecture | MobileNetV2 (pretrained on ImageNet) |
| Input Size | 224 × 224 × 3 |
| Training Platform | Google Colab (T4 GPU) |
| Framework | TensorFlow 2.x / Keras |
| Training Strategy | Transfer Learning + Fine-tuning (2 phases) |
| Phase 1 | Freeze base, train top layers (Adam lr=1e-3) |
| Phase 2 | Unfreeze last 30 layers, fine-tune (Adam lr=1e-4) |
| Callbacks | EarlyStopping, ReduceLROnPlateau |
| Augmentation | Rotation, Zoom, Flip, Shift |
| Saved Format | TensorFlow SavedModel + .h5 |

### Heart Disease Model

| Property | Value |
|---|---|
| Algorithm | Random Forest + XGBoost (Voting Ensemble) |
| Framework | Scikit-learn + XGBoost |
| Input Features | Age, Gender, Chest Pain Type, BP, Cholesterol, Max HR |
| Preprocessing | StandardScaler |
| Saved Format | .pkl (pickle) |

---

## 5. Model Accuracy (Approximate — based on architecture & dataset standards)

> Note: Exact accuracy depends on your training run output.
> These are standard reported accuracies for these datasets with MobileNetV2.

| Disease | Model Type | Expected Accuracy |
|---|---|---|
| Brain Tumor | MobileNetV2 (4-class) | ~92–96% |
| Breast Cancer | MobileNetV2 (3-class) | ~82–88% |
| Pneumonia | MobileNetV2 (binary) | ~90–95% |
| Skin Cancer | MobileNetV2 (binary) | ~83–88% |
| Heart Disease | RF + XGBoost Ensemble | ~85–90% |

> For report: Use your actual Colab output values. Check the last cell output of each notebook.

---

## 6. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | Latest | Build Tool |
| React Router DOM | v7 | Client-side Routing |
| Tailwind CSS | v3 | Styling |
| Framer Motion | Latest | Animations |
| Recharts | Latest | Charts |
| React Icons | Latest | Icons |
| Axios / Fetch | — | API Calls |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.x | Language |
| Flask | Latest | REST API Framework |
| PostgreSQL | Latest | Database |
| SQLAlchemy | Latest | ORM |
| Flask-JWT-Extended | Latest | Authentication |
| bcrypt | Latest | Password Hashing |
| TensorFlow | 2.15 | Deep Learning |
| Scikit-learn | Latest | ML Model |
| XGBoost | Latest | ML Model |
| Pillow + NumPy | Latest | Image Preprocessing |
| Flask-Limiter | Latest | Rate Limiting |
| Flask-CORS | Latest | Cross-Origin Requests |
| Gunicorn | Latest | Production Server |
| Docker | Latest | Containerization |

---

## 7. System Architecture

```
User (Browser)
     |
     | HTTPS
     v
React Frontend (Vercel)
     |
     | REST API calls (JWT in header)
     v
Flask Backend (Render — Docker container)
     |
     |--- PostgreSQL Database (users, predictions)
     |
     |--- ML Models (TensorFlow SavedModel / .pkl)
     |
     |--- Uploads folder (medical images)
```

---

## 8. Database Design

### Table: users

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Unique user ID |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(120) | Email (unique) |
| password | VARCHAR(255) | Bcrypt hashed |
| phone | VARCHAR(20) | Phone number |
| age | INTEGER | Age |
| gender | VARCHAR(10) | Gender |
| blood_group | VARCHAR(5) | Blood group |
| address | VARCHAR(255) | Address |
| emergency_contact | VARCHAR(20) | Emergency contact |
| allergies | VARCHAR(255) | Known allergies |
| conditions | TEXT | Existing conditions |
| created_at | DATETIME | Registration time |

### Table: predictions

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Unique prediction ID |
| user_id | UUID (FK) | References users.id |
| disease_type | VARCHAR(50) | Brain Tumor / Pneumonia etc. |
| result | VARCHAR(50) | Prediction result |
| confidence | FLOAT | Confidence % |
| risk_score | FLOAT | Risk score (heart only) |
| recommendation | TEXT | Medical recommendation |
| image_path | VARCHAR(255) | Uploaded image path |
| created_at | DATETIME | Prediction time |

---

## 9. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, get JWT token |
| POST | /api/predict/brain-tumor | Optional | Brain tumor prediction |
| POST | /api/predict/breast-cancer | Optional | Breast cancer prediction |
| POST | /api/predict/pneumonia | Optional | Pneumonia prediction |
| POST | /api/predict/skin-cancer | Optional | Skin cancer prediction |
| POST | /api/predict/heart | Optional | Heart disease prediction |
| GET | /api/predict/history/mine | Yes | Get user's prediction history |

---

## 10. Key Features for Report

- **Transfer Learning** — MobileNetV2 pretrained on ImageNet, fine-tuned on medical datasets
- **Two-Phase Training** — Phase 1: top layers only, Phase 2: last 30 layers unfrozen
- **Class Imbalance Handling** — compute_class_weight used for Breast, Pneumonia, Skin models
- **Ensemble Model** — Heart disease uses Random Forest + XGBoost voting classifier
- **JWT Authentication** — Stateless, secure token-based auth
- **Rate Limiting** — 200 requests/minute per IP
- **Docker Deployment** — Containerized backend for consistent deployment
- **Responsive Design** — Mobile-friendly Tailwind CSS UI

---

## 11. Future Scope (for Chapter 8)

1. Real-time hospital system integration
2. Doctor consultation feature
3. Mobile app (React Native)
4. More disease support (Diabetic Retinopathy, COVID-19)
5. Explainable AI — Grad-CAM heatmaps on predictions
6. Multi-language support
7. Offline mode with on-device ML

---

## 12. Limitations (for Chapter 7)

1. Models trained on limited dataset sizes
2. No real-time doctor review
3. Heart disease prediction based on limited clinical features
4. Not a replacement for professional medical diagnosis
5. Image quality affects prediction accuracy

---

## 13. References (for Bibliography)

1. Kaggle — Brain Tumor Classification MRI Dataset — sartajbhuvaji
2. Kaggle — Breast Ultrasound Images Dataset — aryashah2k
3. Kaggle — Chest X-Ray Images (Pneumonia) — paultimothymooney
4. Kaggle — Skin Cancer Malignant vs Benign — fanconic
5. Kaggle — Heart Disease UCI — ronitf
6. Sandler et al. — MobileNetV2: Inverted Residuals and Linear Bottlenecks — CVPR 2018
7. TensorFlow Documentation — https://www.tensorflow.org
8. Flask Documentation — https://flask.palletsprojects.com
9. React Documentation — https://react.dev
10. Scikit-learn Documentation — https://scikit-learn.org
11. XGBoost Documentation — https://xgboost.readthedocs.io
