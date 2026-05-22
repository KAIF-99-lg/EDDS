from config.db import db
from datetime import datetime
import uuid

class Prediction(db.Model):
    __tablename__ = "predictions"

    id             = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id        = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    disease_type   = db.Column(db.String(50), nullable=False, index=True)
    result         = db.Column(db.String(50))
    confidence     = db.Column(db.Float)
    risk_score     = db.Column(db.Float)
    details        = db.Column(db.Text)
    recommendation = db.Column(db.Text)
    image_path     = db.Column(db.String(255))
    created_at     = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    user = db.relationship("User", backref="predictions")

    def to_dict(self):
        return {
            "id":             self.id,
            "user_id":        self.user_id,
            "disease_type":   self.disease_type,
            "result":         self.result,
            "confidence":     self.confidence,
            "risk_score":     self.risk_score,
            "recommendation": self.recommendation,
            "image_path":     self.image_path,
            "created_at":     self.created_at.isoformat(),
        }
