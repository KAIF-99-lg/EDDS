# MedAI Backend — Flask + PostgreSQL

## Project Structure
```
backend/
├── app.py                  # Main Flask app entry point
├── config/
│   └── db.py               # Database connection (PostgreSQL)
├── models/
│   ├── user.py             # User model (Doctor + Patient)
│   ├── patient.py          # Patient profile model
│   ├── doctor.py           # Doctor profile model
│   ├── prediction.py       # Prediction results model
│   └── report.py           # Medical reports model
├── routes/
│   ├── auth_routes.py      # /api/auth/login, /api/auth/signup
│   ├── patient_routes.py   # /api/patients CRUD
│   ├── doctor_routes.py    # /api/doctors CRUD
│   ├── prediction_routes.py# /api/predict/* ML endpoints
│   └── report_routes.py    # /api/reports CRUD
├── controllers/
│   ├── auth_controller.py
│   ├── patient_controller.py
│   ├── doctor_controller.py
│   ├── prediction_controller.py
│   └── report_controller.py
├── middleware/
│   └── auth_middleware.py  # JWT token verification
├── ml_models/
│   ├── pneumonia_model.h5      # Trained model file (add yours)
│   ├── heart_model.pkl         # Trained model file (add yours)
│   ├── brain_model.h5          # Trained model file (add yours)
│   ├── skin_model.h5           # Trained model file (add yours)
│   └── breast_model.h5         # Trained model file (add yours)
├── utils/
│   └── image_utils.py      # Image preprocessing helpers
├── requirements.txt
└── .env
```

## Setup Steps
1. `pip install -r requirements.txt`
2. Create `.env` file with DB credentials
3. Run `python app.py`

## API Base URL
`http://localhost:5000/api`
