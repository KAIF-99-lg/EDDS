from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.prediction import Prediction

report_bp = Blueprint("report", __name__)


@report_bp.get("/")
@jwt_required()
def get_reports():
    user_id = get_jwt_identity()
    preds = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    return jsonify([p.to_dict() for p in preds]), 200
