from flask import Blueprint
from flask_jwt_extended import jwt_required
from models.doctor import Doctor

doctor_bp = Blueprint("doctors", __name__)

@doctor_bp.get("/")
@jwt_required()
def get_all_doctors():
    from flask import jsonify
    doctors = Doctor.query.all()
    return jsonify([d.to_dict() for d in doctors]), 200

@doctor_bp.get("/<id>")
@jwt_required()
def get_doctor(id):
    from flask import jsonify
    doctor = Doctor.query.get_or_404(id)
    return jsonify(doctor.to_dict()), 200
