import os
import uuid
import numpy as np
from datetime import datetime
from flask import request, jsonify
from utils.image_utils import preprocess_image

BASE       = os.path.join(os.path.dirname(__file__), "..", "ml_models")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Injected from app.py
pneumonia_model = None
brain_model     = None
skin_model      = None
breast_model    = None
heart_model     = None
heart_scaler    = None


def _predict(model, img):
    import tensorflow as tf
    if model is None:
        return None
    try:
        return model.predict(img)
    except Exception:
        pass
    try:
        infer = model.signatures["serving_default"]
        input_key = list(infer.structured_input_signature[1].keys())[0]
        result = infer(**{input_key: tf.constant(img, dtype=tf.float32)})
        output_key = list(result.keys())[0]
        return result[output_key].numpy()
    except Exception as e:
        print(f"_predict failed: {e}")
        return None


def _save_image(image_file, prefix):
    try:
        image_file.seek(0)
        ext      = os.path.splitext(image_file.filename)[-1] or ".png"
        filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
        path     = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as f:
            f.write(image_file.read())
        image_file.seek(0)
        return f"uploads/{filename}"
    except Exception:
        return None


def _resp(disease, result, confidence=None, risk_score=None, recommendation=""):
    return jsonify({
        "disease": disease,
        "result": result,
        "confidence": confidence,
        "risk_score": risk_score,
        "recommendation": recommendation,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200


# ── Heart Disease ─────────────────────────────────────────────
def predict_heart():
    data = request.get_json()

    cp_map = {"Typical Angina": 0, "Atypical Angina": 1, "Non-anginal": 2, "Asymptomatic": 3}

    features = np.array([[
        float(data.get("age", 50)),
        1 if data.get("gender") == "Male" else 0,
        cp_map.get(data.get("chestPain", "Asymptomatic"), 3),
        float(data.get("bp", 120)),
        float(data.get("cholesterol", 200)),
        0,  # bloodSugar default
        0,  # restingECG default
        float(data.get("maxHR", 150)),
        0,  # exerciseAngina default
        1.0,  # oldpeak default
        1,  # slope default
        0,  # majorVessels default
        0,  # thal default
    ]])

    if heart_scaler:
        features = heart_scaler.transform(features)

    risk_score = float(heart_model.predict_proba(features)[0][1] * 100) if heart_model else 50.0
    result     = "High Risk" if risk_score > 50 else "Low Risk"
    rec        = "Cardiac evaluation recommended." if result == "High Risk" else "Low risk. Maintain healthy lifestyle."

    return _resp("Heart Disease", result, risk_score=round(risk_score, 2), recommendation=rec)


# ── Pneumonia ─────────────────────────────────────────────────
def predict_pneumonia():
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    _save_image(image_file, "pneumonia")
    img   = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)
    preds = _predict(pneumonia_model, img)
    raw   = float(preds[0][0]) if preds is not None else 0.5

    confidence = round(raw * 100, 2)
    result     = "Positive" if raw > 0.5 else "Negative"
    rec        = "Consult pulmonologist immediately." if result == "Positive" else "No pneumonia detected."

    return _resp("Pneumonia", result, confidence=confidence, recommendation=rec)


# ── Brain Tumor ───────────────────────────────────────────────
def predict_brain():
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    import json
    _save_image(image_file, "brain")
    img       = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)
    preds_raw = _predict(brain_model, img)

    if preds_raw is not None:
        classes_path = os.path.join(BASE, "brain_classes.json")
        if os.path.exists(classes_path):
            with open(classes_path) as f:
                class_indices = json.load(f)
            idx_to_class = {v: k for k, v in class_indices.items()}
        else:
            idx_to_class = {0: "glioma_tumor", 1: "meningioma_tumor", 2: "no_tumor", 3: "pituitary_tumor"}

        preds      = preds_raw[0]
        class_idx  = int(np.argmax(preds))
        confidence = round(float(np.max(preds)) * 100, 2)
        raw        = idx_to_class.get(class_idx, "unknown")
        result     = {"no_tumor": "No Tumor", "glioma_tumor": "Glioma",
                      "meningioma_tumor": "Meningioma", "pituitary_tumor": "Pituitary"}.get(raw, raw.replace("_", " ").title())
    else:
        result, confidence = "Unknown", 0.0

    recs = {
        "No Tumor":   "No tumor detected. Routine checkup advised.",
        "Glioma":     "Glioma detected. Urgent neurosurgical consultation required.",
        "Meningioma": "Meningioma detected. Neurology referral recommended.",
        "Pituitary":  "Pituitary tumor detected. Endocrinology consultation advised.",
    }
    return _resp("Brain Tumor", result, confidence=confidence, recommendation=recs.get(result, "Consult a specialist."))


# ── Skin Cancer ───────────────────────────────────────────────
def predict_skin():
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    _save_image(image_file, "skin")
    img   = preprocess_image(image_file, target_size=(224, 224), mobilenet=True)
    preds = _predict(skin_model, img)
    raw   = float(preds[0][0]) if preds is not None else 0.5

    confidence = round(raw * 100, 2)
    result     = "Melanoma Detected" if raw > 0.5 else "Benign"
    rec        = "Immediate dermatology referral required." if "Melanoma" in result else "Benign lesion. Monitor for changes."

    return _resp("Skin Cancer", result, confidence=confidence, recommendation=rec)


# ── Breast Cancer ─────────────────────────────────────────────
def predict_breast():
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "Image required"}), 400

    import json
    _save_image(image_file, "breast")
    img       = preprocess_image(image_file, target_size=(224, 224))
    preds_raw = _predict(breast_model, img)

    if preds_raw is not None:
        classes_path = os.path.join(BASE, "breast_classes.json")
        with open(classes_path) as f:
            class_indices = json.load(f)
        idx_to_class  = {v: k.capitalize() for k, v in class_indices.items()}
        preds         = preds_raw[0]
        class_idx     = int(np.argmax(preds))
        confidence    = round(float(np.max(preds)) * 100, 2)
        result        = idx_to_class.get(class_idx, "Unknown")
    else:
        result, confidence = "Unknown", 0.0

    recs = {
        "Malignant": "Urgent oncology consultation required.",
        "Benign":    "Benign finding. Regular follow-up advised.",
        "Normal":    "No abnormality detected. Routine screening recommended.",
    }
    return _resp("Breast Cancer", result, confidence=confidence, recommendation=recs.get(result, "Consult a specialist."))
