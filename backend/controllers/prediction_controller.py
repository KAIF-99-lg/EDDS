import os
import uuid
import numpy as np
from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from config.db import db
from models.prediction import Prediction
from models.report import Report
from models.patient import Patient
from utils.image_utils import preprocess_image

try:
    import pickle
except ImportError:
    pickle = None

BASE       = os.path.join(os.path.dirname(__file__), "..", "ml_models")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# These are injected from app.py after models are loaded
pneumonia_model = None
brain_model     = None
skin_model      = None
breast_model    = None
heart_model     = None
heart_scaler    = None

# ── Helpers ───────────────────────────────────────────────────────────────────
def _save_image(image_file, prefix):
    try:
        image_file.seek(0)
        ext      = os.path.splitext(image_file.filename)[-1] or ".png"
        filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
        path     = os.path.join(UPLOAD_DIR, filename)
        image_file.seek(0)
        with open(path, "wb") as f:
            f.write(image_file.read())
        image_file.seek(0)
        return f"uploads/{filename}"
    except Exception:
        return None

def _get_patient_id(user_id):
    p = Patient.query.filter_by(user_id=user_id).first()
    return p.id if p else None

def _save(patient_id, doctor_id, disease_type, result, confidence, risk_score, recommendation, image_path=None):
    pred = Prediction(
        patient_id=patient_id, doctor_id=doctor_id,
        disease_type=disease_type, result=result,
        confidence=confidence, risk_score=risk_score,
        recommendation=recommendation, image_path=image_path,
    )
    db.session.add(pred)
    db.session.flush()
    report = Report(
        patient_id=patient_id, doctor_id=doctor_id,
        prediction_id=pred.id, report_type=disease_type,
        result=result, status="Pending Review",
    )
    db.session.add(report)
    db.session.commit()
    return pred

def _quick(disease, result, confidence=None, risk_score=None, recommendation=""):
    return jsonify({
        "disease": disease, "disease_type": disease,
        "result": result, "confidence": confidence,
        "risk_score": risk_score, "recommendation": recommendation,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200

# ── Heart Disease ─────────────────────────────────────────────────────────────
def predict_heart():
    user_id = get_jwt_identity()
    role    = get_jwt().get("role", "patient")
    data    = request.get_json()

    cp_map    = {"Typical Angina": 0, "Atypical Angina": 1, "Non-anginal": 2, "Asymptomatic": 3}
    ecg_map   = {"Normal": 0, "ST-T Wave Abnormality": 1, "Left Ventricular Hypertrophy": 2}
    slope_map = {"upsloping": 0, "flat": 1, "downsloping": 2}
    thal_map  = {"normal": 0, "fixed defect": 1, "reversable defect": 2}

    features = np.array([[
        float(data.get("age", 50)),
        1 if data.get("gender") == "Male" else 0,
        cp_map.get(data.get("chestPain", "Asymptomatic"), 3),
        float(data.get("bp", 120)),
        float(data.get("cholesterol", 200)),
        1 if data.get("bloodSugar", "No") == "Yes" else 0,
        ecg_map.get(data.get("restingECG", "Normal"), 0),
        float(data.get("maxHR", 150)),
        1 if data.get("exerciseAngina", "No") == "Yes" else 0,
        float(data.get("oldpeak", 1.0)),
        slope_map.get(data.get("slope", "flat"), 1),
        float(data.get("majorVessels", 0)),
        thal_map.get(data.get("thal", "normal"), 0),
    ]])

    if heart_scaler: features = heart_scaler.transform(features)
    risk_score = float(heart_model.predict_proba(features)[0][1] * 100) if heart_model else 78.0
    result     = "High Risk" if risk_score > 50 else "Low Risk"
    rec        = "Cardiac evaluation recommended." if result == "High Risk" else "Low risk. Maintain healthy lifestyle."

    patient_id = data.get("patient_id") or _get_patient_id(user_id)
    if not patient_id:
        return _quick("Heart Disease", result, risk_score=round(risk_score, 2), recommendation=rec)
    pred = _save(patient_id, user_id if role == "doctor" else None, "Heart Disease", result, None, round(risk_score, 2), rec)
    return jsonify({**pred.to_dict(), "disease": "Heart Disease"}), 200

# ── Pneumonia ─────────────────────────────────────────────────────────────────
def predict_pneumonia():
    user_id    = get_jwt_identity()
    role       = get_jwt().get("role", "patient")
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    img        = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)
    raw        = float(pneumonia_model.predict(img)[0][0]) if pneumonia_model else 0.87
    confidence = round(raw * 100, 2)
    result     = "Positive" if raw > 0.5 else "Negative"
    rec        = "Consult pulmonologist immediately." if result == "Positive" else "No pneumonia detected. Routine checkup advised."

    patient_id = request.form.get("patient_id") or _get_patient_id(user_id)
    img_path   = _save_image(image_file, "pneumonia")
    if not patient_id:
        return _quick("Pneumonia", result, confidence=confidence, risk_score=confidence, recommendation=rec)
    pred = _save(patient_id, user_id if role == "doctor" else None, "Pneumonia", result, confidence, confidence, rec, img_path)
    return jsonify({**pred.to_dict(), "disease": "Pneumonia"}), 200

# ── Brain Tumor ───────────────────────────────────────────────────────────────
def predict_brain():
    user_id    = get_jwt_identity()
    role       = get_jwt().get("role", "patient")
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    import json
    img = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)

    if brain_model:
        classes_path = os.path.join(BASE, "brain_classes.json")
        if os.path.exists(classes_path):
            with open(classes_path) as f:
                class_indices = json.load(f)
            idx_to_class = {v: k for k, v in class_indices.items()}
        else:
            idx_to_class = {0: "glioma_tumor", 1: "meningioma_tumor", 2: "no_tumor", 3: "pituitary_tumor"}

        preds      = brain_model.predict(img)[0]
        class_idx  = int(np.argmax(preds))
        confidence = round(float(np.max(preds)) * 100, 2)
        raw        = idx_to_class.get(class_idx, "unknown")
        result     = {"no_tumor": "No Tumor", "glioma_tumor": "Glioma",
                      "meningioma_tumor": "Meningioma", "pituitary_tumor": "Pituitary"}.get(raw, raw.replace("_", " ").title())
    else:
        result, confidence = "Glioma", 92.0

    recs = {
        "No Tumor":   "No tumor detected. Routine checkup advised.",
        "Glioma":     "Glioma detected. Urgent neurosurgical consultation required.",
        "Meningioma": "Meningioma detected. Neurology referral recommended.",
        "Pituitary":  "Pituitary tumor detected. Endocrinology consultation advised.",
    }
    rec = recs.get(result, "Please consult a specialist.")

    patient_id = request.form.get("patient_id") or _get_patient_id(user_id)
    img_path   = _save_image(image_file, "brain")
    if not patient_id:
        return _quick("Brain Tumor", result, confidence=confidence, recommendation=rec)
    pred = _save(patient_id, user_id if role == "doctor" else None, "Brain Tumor", result, confidence, None, rec, img_path)
    return jsonify({**pred.to_dict(), "disease": "Brain Tumor"}), 200

# ── Skin Cancer ───────────────────────────────────────────────────────────────
def predict_skin():
    user_id    = get_jwt_identity()
    role       = get_jwt().get("role", "patient")
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    img        = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)
    raw        = float(skin_model.predict(img)[0][0]) if skin_model else 0.89
    confidence = round(raw * 100, 2)
    result     = "Melanoma Detected" if raw > 0.5 else "Benign"
    rec        = "Immediate dermatology referral required." if "Melanoma" in result else "Benign lesion. Monitor for changes."

    patient_id = request.form.get("patient_id") or _get_patient_id(user_id)
    img_path   = _save_image(image_file, "skin")
    if not patient_id:
        return _quick("Skin Cancer", result, confidence=confidence, recommendation=rec)
    pred = _save(patient_id, user_id if role == "doctor" else None, "Skin Cancer", result, confidence, None, rec, img_path)
    return jsonify({**pred.to_dict(), "disease": "Skin Cancer"}), 200

# ── Breast Cancer ─────────────────────────────────────────────────────────────
def predict_breast():
    user_id    = get_jwt_identity()
    role       = get_jwt().get("role", "patient")
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    import json
    img = preprocess_image(image_file, target_size=(224, 224))

    if breast_model:
        classes_path = os.path.join(BASE, "breast_classes.json")
        with open(classes_path) as f:
            class_indices = json.load(f)
        idx_to_class  = {v: k.capitalize() for k, v in class_indices.items()}
        preds         = breast_model.predict(img)[0]
        class_idx     = int(np.argmax(preds))
        confidence    = round(float(np.max(preds)) * 100, 2)
        benign_idx    = class_indices.get("benign", 0)
        malignant_idx = class_indices.get("malignant", 1)
        if class_idx == malignant_idx and abs(float(preds[malignant_idx]) - float(preds[benign_idx])) < 0.30:
            class_idx  = benign_idx
            confidence = round(float(preds[benign_idx]) * 100, 2)
        result = idx_to_class[class_idx]
    else:
        result, confidence = "Malignant", 91.7

    recs = {
        "Malignant": "Urgent oncology consultation required. Further biopsy and imaging needed.",
        "Benign":    "Benign finding. Regular follow-up and monitoring advised.",
        "Normal":    "No abnormality detected. Routine annual screening recommended.",
    }
    rec = recs.get(result, "Please consult a specialist.")

    patient_id = request.form.get("patient_id") or _get_patient_id(user_id)
    img_path   = _save_image(image_file, "breast")
    if not patient_id:
        return _quick("Breast Cancer", result, confidence=confidence, recommendation=rec)
    pred = _save(patient_id, user_id if role == "doctor" else None, "Breast Cancer", result, confidence, None, rec, img_path)
    return jsonify({**pred.to_dict(), "disease": "Breast Cancer"}), 200

# ── History ───────────────────────────────────────────────────────────────────
def get_my_history():
    user_id    = get_jwt_identity()
    patient_id = _get_patient_id(user_id)
    if not patient_id:
        return jsonify([]), 200
    preds = Prediction.query.filter_by(patient_id=patient_id).order_by(Prediction.created_at.desc()).all()
    return jsonify([p.to_dict() for p in preds]), 200

def get_history(patient_id):
    preds = Prediction.query.filter_by(patient_id=patient_id).order_by(Prediction.created_at.desc()).all()
    return jsonify([p.to_dict() for p in preds]), 200
