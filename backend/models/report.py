from config.db import db
from datetime import datetime
import uuid

class Report(db.Model):
    __tablename__ = "reports"

    id            = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id    = db.Column(db.String(36), db.ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id     = db.Column(db.String(36), db.ForeignKey("doctors.id"), nullable=True)
    prediction_id = db.Column(db.String(36), db.ForeignKey("predictions.id"), nullable=True)
    report_type   = db.Column(db.String(50), index=True)
    result        = db.Column(db.String(50))
    doctor_notes  = db.Column(db.Text)
    status        = db.Column(db.String(20), default="Pending Review", index=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    patient    = db.relationship("Patient",    backref="reports")
    doctor     = db.relationship("Doctor",     backref="reviewed_reports")
    prediction = db.relationship("Prediction", backref="report", foreign_keys=[prediction_id])

    def to_dict(self):
        d = {
            "id":           self.id,
            "patient_id":   self.patient_id,
            "doctor_id":    self.doctor_id,
            "report_type":  self.report_type,
            "result":       self.result,
            "doctor_notes": self.doctor_notes,
            "status":       self.status,
            "created_at":   self.created_at.isoformat(),
        }
        if self.prediction:
            d["confidence"]     = self.prediction.confidence
            d["risk_score"]     = self.prediction.risk_score
            d["recommendation"] = self.prediction.recommendation
            d["image_path"]     = self.prediction.image_path
        if self.doctor:
            d["doctor_name"]    = self.doctor.user.name if self.doctor.user else ""
            d["hospital"]       = self.doctor.hospital or ""
            d["specialization"] = self.doctor.specialization or ""
        if self.patient:
            d["patient_name"]        = self.patient.user.name if self.patient.user else ""
            d["patient_age"]         = self.patient.age
            d["patient_gender"]      = self.patient.gender
            d["patient_blood_group"] = self.patient.blood_group
        return d
