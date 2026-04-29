from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.report_controller import get_all_reports, get_my_reports, get_patient_reports, update_report

report_bp = Blueprint("reports", __name__)

report_bp.get("/")(jwt_required()(get_all_reports))
report_bp.get("/mine")(jwt_required()(get_my_reports))
report_bp.get("/patient/<patient_id>")(jwt_required()(get_patient_reports))
report_bp.put("/<id>")(jwt_required()(update_report))
