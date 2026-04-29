from config.db import db
from datetime import datetime
import uuid

class Patient(db.Model):
    __tablename__ = "patients"

    id                = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id           = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    age               = db.Column(db.Integer)
    gender            = db.Column(db.String(10))
    blood_group       = db.Column(db.String(5))
    phone             = db.Column(db.String(20))
    address           = db.Column(db.String(255))
    risk_level        = db.Column(db.String(10), default="Low")       # Low/Medium/High/Critical
    status            = db.Column(db.String(20), default="Active")
    conditions        = db.Column(db.Text)                            # comma separated
    emergency_contact = db.Column(db.String(20))
    allergies         = db.Column(db.String(255))
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at        = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref="patient_profile")

    def to_dict(self):
        return {
            "id":               self.id,
            "user_id":          self.user_id,
            "name":             self.user.name  if self.user else "",
            "email":            self.user.email if self.user else "",
            "age":              self.age,
            "gender":           self.gender,
            "blood_group":      self.blood_group,
            "phone":            self.phone,
            "address":          self.address,
            "emergency_contact":self.emergency_contact,
            "allergies":        self.allergies,
            "risk_level":       self.risk_level,
            "status":           self.status,
            "conditions":       self.conditions.split(",") if self.conditions else [],
        }
