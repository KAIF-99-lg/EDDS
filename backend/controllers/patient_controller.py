from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from config.db import db
from models.user import User

def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

def update_my_profile():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(user_id)
    data    = request.get_json()
    allowed = ["name", "phone", "age", "gender", "blood_group", "address", "emergency_contact", "allergies", "conditions"]
    for key in allowed:
        if key in data:
            setattr(user, key, data[key])
    db.session.commit()
    return jsonify(user.to_dict()), 200
