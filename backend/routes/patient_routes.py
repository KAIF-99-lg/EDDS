from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.db import db
from models.user import User
from models.prediction import Prediction

patient_bp = Blueprint("patient", __name__)


@patient_bp.get("/me")
@jwt_required()
def get_profile():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@patient_bp.put("/me")
@jwt_required()
def update_profile():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    allowed = ["name", "phone", "age", "gender", "blood_group",
               "address", "emergency_contact", "allergies", "conditions"]
    for field in allowed:
        if field in data:
            if field == "conditions" and isinstance(data[field], list):
                setattr(user, field, ",".join(data[field]))
            else:
                setattr(user, field, data[field])

    db.session.commit()
    return jsonify(user.to_dict()), 200
