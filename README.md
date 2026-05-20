# EDDS — Early Disease Detection System

A full-stack AI-powered medical application that enables patients to detect diseases from medical images and allows doctors to monitor and manage patient health records.

---

## Features

### Patient Features
- **AI Disease Detection** — Upload medical images to detect:
  - Brain Tumor (MRI scan)
  - Breast Cancer (ultrasound/mammogram)
  - Pneumonia (chest X-ray)
  - Skin Cancer (dermoscopy image)
  - Heart Disease (form-based prediction using clinical data)
- **Prediction History** — View all past detection results with confidence scores
- **Medical Reports** — Access and download PDF reports of diagnoses
- **Patient Profile** — Manage personal and medical information
- **Patient Dashboard** — Overview of health status and recent activity

### Doctor Features
- **Doctor Dashboard** — Summary of assigned patients and recent predictions
- **Patient Management** — Add, view, and manage patient records
- **Patient Monitoring** — Track patient health trends over time using charts
- **Patient Details** — View full medical history and prediction results of a patient
- **Report Review** — Review AI-generated reports and add doctor notes
- **Alerts** — Get notified about critical patient conditions

### General Features
- **Authentication** — Secure login/signup with JWT-based auth and bcrypt password hashing
- **Role-based Access** — Separate dashboards and routes for Doctors and Patients
- **Protected Routes** — Unauthorized users cannot access dashboard pages
- **PDF Export** — Download medical reports as PDF using jsPDF + html2canvas
- **Responsive UI** — Mobile-friendly design with Tailwind CSS
- **Animations** — Smooth transitions using Framer Motion
- **Rate Limiting** — API protection against abuse

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Health data charts |
| React Icons | Icon library |
| jsPDF + html2canvas | PDF report generation |

### Backend
| Technology | Purpose |
|---|---|
| Flask | REST API framework |
| PostgreSQL + SQLAlchemy | Database & ORM |
| Flask-JWT-Extended | Authentication |
| bcrypt | Password hashing |
| TensorFlow 2.15 | Deep learning models (image-based) |
| Scikit-learn + XGBoost | Heart disease prediction model |
| Pillow + NumPy | Image preprocessing |
| Flask-Limiter | API rate limiting |
| Gunicorn + Docker | Production deployment |

---

## AI Models

| Disease | Model Type | Input |
|---|---|---|
| Brain Tumor | TensorFlow SavedModel | MRI image |
| Breast Cancer | TensorFlow SavedModel | Ultrasound image |
| Pneumonia | TensorFlow SavedModel | Chest X-ray |
| Skin Cancer | TensorFlow SavedModel | Skin image |
| Heart Disease | Scikit-learn `.pkl` | Clinical form data |

---

## Project Structure

```
EDDS/
├── backend/                  # Flask API
│   ├── config/               # Database config
│   ├── controllers/          # Business logic
│   ├── middleware/           # JWT auth middleware
│   ├── ml_models/            # Trained AI models
│   ├── models/               # SQLAlchemy DB models
│   ├── routes/               # API route definitions
│   ├── utils/                # Image preprocessing helpers
│   ├── uploads/              # Uploaded medical images
│   ├── app.py                # Flask entry point
│   └── requirements.txt
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── layouts/              # Dashboard & protected route layouts
│   ├── pages/
│   │   ├── doctor/           # Doctor-specific pages
│   │   └── patient/          # Patient-specific pages
│   ├── services/             # API call functions
│   └── utils/                # Helper functions & PDF generator
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # Fill in DB credentials and JWT secret
python app.py
```

### Frontend
```bash
npm install
cp .env.production.example .env.production   # Set API base URL
npm run dev
```

---

## Deployment
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com) (via Docker)

---

## API Base URL
```
http://localhost:5000/api
```

### Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/patients` | Get all patients (doctor only) |
| POST | `/api/predict/brain` | Brain tumor prediction |
| POST | `/api/predict/breast` | Breast cancer prediction |
| POST | `/api/predict/pneumonia` | Pneumonia prediction |
| POST | `/api/predict/skin` | Skin cancer prediction |
| POST | `/api/predict/heart` | Heart disease prediction |
| GET | `/api/reports` | Get medical reports |
