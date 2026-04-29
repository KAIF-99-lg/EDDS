from flask import request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from config.db import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor

def login():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role}
    )

    profile = {}
    if user.role == "patient":
        p = Patient.query.filter_by(user_id=user.id).first()
        profile = p.to_dict() if p else {}
    elif user.role == "doctor":
        d = Doctor.query.filter_by(user_id=user.id).first()
        profile = d.to_dict() if d else {}

    return jsonify({"token": token, "user": {**user.to_dict(), **profile}}), 200


def signup():
    data     = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "patient")

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user   = User(name=name, email=email, password=hashed, role=role)
    db.session.add(user)
    db.session.flush()

    if role == "patient":
        db.session.add(Patient(
            user_id     = user.id,
            gender      = data.get("gender", ""),
            age         = data.get("age") or None,
            phone       = data.get("phone", ""),
            blood_group = data.get("blood_group", ""),
            address     = data.get("address", ""),
        ))
    elif role == "doctor":
        db.session.add(Doctor(
            user_id        = user.id,
            gender         = data.get("gender", ""),
            specialization = data.get("specialization", ""),
            hospital       = data.get("hospital", ""),
            license_number = data.get("license_number", ""),
            phone          = data.get("phone", ""),
        ))

    db.session.commit()
    return jsonify({"message": "Account created successfully"}), 201
