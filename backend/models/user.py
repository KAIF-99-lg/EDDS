from config.db import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = "users"

    id                = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name              = db.Column(db.String(100), nullable=False)
    email             = db.Column(db.String(120), unique=True, nullable=False)
    password          = db.Column(db.String(255), nullable=True)
    phone             = db.Column(db.String(20))
    age               = db.Column(db.Integer)
    gender            = db.Column(db.String(10))
    blood_group       = db.Column(db.String(5))
    address           = db.Column(db.String(255))
    emergency_contact = db.Column(db.String(20))
    allergies         = db.Column(db.String(255))
    conditions        = db.Column(db.Text)
    role              = db.Column(db.String(20), default="patient")
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":                self.id,
            "name":              self.name,
            "email":             self.email,
            "phone":             self.phone,
            "age":               self.age,
            "gender":            self.gender,
            "blood_group":       self.blood_group,
            "address":           self.address,
            "emergency_contact": self.emergency_contact,
            "allergies":         self.allergies,
            "conditions":        self.conditions.split(",") if self.conditions else [],
            "role":               self.role or "patient",
            "created_at":        self.created_at.isoformat(),
        }
