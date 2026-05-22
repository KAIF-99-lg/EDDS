from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.db import db
from models.report import Report
from sqlalchemy.orm import joinedload

def get_all_reports():
    user_id = get_jwt_identity()
    reports = Report.query.options(joinedload(Report.user), joinedload(Report.prediction)).filter_by(user_id=user_id).order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def get_my_reports():
    user_id = get_jwt_identity()
    reports = Report.query.options(joinedload(Report.user), joinedload(Report.prediction)).filter_by(user_id=user_id).order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def get_patient_reports(patient_id):
    reports = Report.query.options(joinedload(Report.user), joinedload(Report.prediction)).filter_by(user_id=patient_id).order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def update_report(id):
    report = Report.query.get_or_404(id)
    data   = request.get_json()
    report.status = data.get("status", report.status)
    db.session.commit()
    return jsonify(report.to_dict()), 200
