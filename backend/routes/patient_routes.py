from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.patient_controller import get_all_patients, get_my_profile, get_patient, add_patient, update_patient, delete_patient

patient_bp = Blueprint("patients", __name__)

patient_bp.get("")(jwt_required()(get_all_patients))
patient_bp.get("/me")(jwt_required()(get_my_profile))
patient_bp.get("/<id>")(jwt_required()(get_patient))
patient_bp.post("")(jwt_required()(add_patient))
patient_bp.put("/<id>")(jwt_required()(update_patient))
patient_bp.delete("/<id>")(jwt_required()(delete_patient))
