from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.patient_controller import get_my_profile, update_my_profile

patient_bp = Blueprint("patients", __name__)

patient_bp.get("/me")(jwt_required()(get_my_profile))
patient_bp.put("/me")(jwt_required()(update_my_profile))
