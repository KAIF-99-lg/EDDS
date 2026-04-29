from config.db import db
from datetime import datetime
import uuid

class Doctor(db.Model):
    __tablename__ = "doctors"

    id               = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id          = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    gender           = db.Column(db.String(10))
    specialization   = db.Column(db.String(100))
    license_number   = db.Column(db.String(50))
    phone            = db.Column(db.String(20))
    hospital         = db.Column(db.String(100))
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="doctor_profile")

    def to_dict(self):
        return {
            "id":             self.id,
            "user_id":        self.user_id,
            "name":           self.user.name if self.user else "",
            "email":          self.user.email if self.user else "",
            "gender":         self.gender,
            "specialization": self.specialization,
            "license_number": self.license_number,
            "phone":          self.phone,
            "hospital":       self.hospital,
        }
