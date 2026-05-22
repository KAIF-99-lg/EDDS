from config.db import db
from datetime import datetime
import uuid

class Report(db.Model):
    __tablename__ = "reports"

    id            = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id       = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    prediction_id = db.Column(db.String(36), db.ForeignKey("predictions.id"), nullable=True)
    report_type   = db.Column(db.String(50), index=True)
    result        = db.Column(db.String(50))
    status        = db.Column(db.String(20), default="Pending Review", index=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    user       = db.relationship("User",       backref="reports")
    prediction = db.relationship("Prediction", backref="report", foreign_keys=[prediction_id])

    def to_dict(self):
        d = {
            "id":          self.id,
            "user_id":     self.user_id,
            "report_type": self.report_type,
            "result":      self.result,
            "status":      self.status,
            "created_at":  self.created_at.isoformat(),
        }
        if self.prediction:
            d["confidence"]     = self.prediction.confidence
            d["risk_score"]     = self.prediction.risk_score
            d["recommendation"] = self.prediction.recommendation
            d["image_path"]     = self.prediction.image_path
        if self.user:
            d["user_name"]   = self.user.name
            d["user_age"]    = self.user.age
            d["user_gender"] = self.user.gender
        return d
