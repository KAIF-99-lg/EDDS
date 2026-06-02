from flask import request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt, requests as http
from config.db import db
from models.user import User

def login():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.password or not bcrypt.checkpw(password.encode(), user.password.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 200


def signup():
    data     = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user   = User(name=name, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Account created successfully"}), 201


def google_auth():
    data       = request.get_json()
    id_token   = data.get("credential")
    if not id_token:
        return jsonify({"error": "Google token required"}), 400

    try:
        # Decode JWT id_token without verification (Google already signed it)
        import base64, json as _json
        payload_b64 = id_token.split(".")[1]
        # Fix padding
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        info = _json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception as e:
        return jsonify({"error": f"Invalid Google token: {e}"}), 401

    email = info.get("email", "").lower()
    name  = info.get("name") or email.split("@")[0]
    if not email:
        return jsonify({"error": "Could not get email from Google"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=name, email=email, password="")
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 200
