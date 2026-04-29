from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from functools import wraps

def doctor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "doctor":
            return jsonify({"error": "Doctor access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def patient_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "patient":
            return jsonify({"error": "Patient access required"}), 403
        return fn(*args, **kwargs)
    return wrapper
