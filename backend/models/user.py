from config.db import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = "users"

    id           = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name         = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    password     = db.Column(db.String(255), nullable=False)          # bcrypt hashed
    role         = db.Column(db.String(10), nullable=False)           # "patient" or "doctor"
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "role":       self.role,
            "created_at": self.created_at.isoformat(),
        }
