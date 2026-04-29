from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.db import db
from models.patient import Patient
from models.user import User

def _get_patient_by_user(user_id):
    return Patient.query.filter_by(user_id=user_id).first()

def get_all_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients]), 200

def get_my_profile():
    user_id = get_jwt_identity()
    patient = _get_patient_by_user(user_id)
    if not patient:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(patient.to_dict()), 200

def get_patient(id):
    patient = Patient.query.get_or_404(id)
    return jsonify(patient.to_dict()), 200

def add_patient():
    data  = request.get_json()
    email = data.get("email", "")

    # Create a user account for the patient
    existing = User.query.filter_by(email=email).first() if email else None
    if existing:
        return jsonify({"error": "Email already exists"}), 409

    import bcrypt as _bcrypt
    temp_pass = _bcrypt.hashpw(b"changeme123", _bcrypt.gensalt()).decode()
    user = User(name=data.get("name", ""), email=email, password=temp_pass, role="patient")
    db.session.add(user)
    db.session.flush()  # get user.id

    patient = Patient(
        user_id           = user.id,
        age               = data.get("age"),
        gender            = data.get("gender"),
        blood_group       = data.get("bloodGroup"),
        phone             = data.get("phone"),
        risk_level        = data.get("riskLevel", "Low"),
        status            = data.get("status", "Active"),
        conditions        = data.get("conditions", ""),
        emergency_contact = data.get("emergencyContact"),
        allergies         = data.get("allergies"),
    )
    db.session.add(patient)
    db.session.commit()
    return jsonify(patient.to_dict()), 201

def update_patient(id):
    patient = Patient.query.get_or_404(id)
    data    = request.get_json()
    for key, val in data.items():
        if hasattr(patient, key):
            setattr(patient, key, val)
    db.session.commit()
    return jsonify(patient.to_dict()), 200

def delete_patient(id):
    patient = Patient.query.get_or_404(id)
    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient deleted"}), 200
