from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.db import db
from models.report import Report
from models.patient import Patient

def _get_patient_id(user_id):
    p = Patient.query.filter_by(user_id=user_id).first()
    return p.id if p else None

def get_all_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def get_my_reports():
    user_id    = get_jwt_identity()
    patient_id = _get_patient_id(user_id)
    if not patient_id:
        return jsonify([]), 200
    reports = Report.query.filter_by(patient_id=patient_id).order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def get_patient_reports(patient_id):
    reports = Report.query.filter_by(patient_id=patient_id).order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200

def update_report(id):
    report = Report.query.get_or_404(id)
    data   = request.get_json()
    report.doctor_notes = data.get("doctor_notes", report.doctor_notes)
    report.status       = data.get("status", report.status)
    db.session.commit()
    return jsonify(report.to_dict()), 200
