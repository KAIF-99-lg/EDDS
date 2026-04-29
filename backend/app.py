from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import requests

from config.db import db
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.prediction_routes import prediction_bp
from routes.report_routes import report_bp

load_dotenv()

# ── Download ML models from Google Drive if not present ──────────────────────
ML_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
os.makedirs(ML_DIR, exist_ok=True)

MODELS = {
    "skin_model.h5":       "12Yg7X57BGaPBoTABeD_7UYv7JsrJoaxI",
    "pneumonia_model.h5":  "1Kg8DC7WR36wxioYRsvg5K6wB-QQoJ7Nh",
    "heart_scaler.pkl":    "1SN9cjfItVbiGO6WEkohVoqlfcq-oV_Ub",
    "heart_model.pkl":     "1KL1m745h1wFlAL-GBvpQvBsPh3gQV_Ci",
    "breast_model.h5":     "1vyt7OmEprrcv7LnUp1xVsUvPMwbc7vOZ",
    "breast_classes.json": "1R0uAhH2p2rmuF37937kh8VUkod05EJOd",
    "brain_model.h5":      "1nb5MB69E_bK2MSuLeRtFTcDXfoZIliKW",
    "brain_classes.json":  "1oxfQMkCBiMK-zemXZ2TffA261PZ4L-nO",
}

def download_file(file_id, dest_path):
    print(f"Downloading {os.path.basename(dest_path)}...")
    session = requests.Session()

    # Step 1: Initial request
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = session.get(url, stream=True)

    # Step 2: Handle virus scan warning for large files
    token = None
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            token = value
            break

    # Also check response content for confirmation token
    if not token and b"confirm=" in response.content[:2048]:
        import re
        match = re.search(rb"confirm=([0-9A-Za-z_]+)", response.content[:2048])
        if match:
            token = match.group(1).decode()

    if token:
        response = session.get(url, params={"confirm": token, "id": file_id}, stream=True)

    # Step 3: Write file
    total = 0
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=65536):
            if chunk:
                f.write(chunk)
                total += len(chunk)

    size_mb = total / (1024 * 1024)
    print(f"Downloaded {os.path.basename(dest_path)} ({size_mb:.1f} MB)")

    # If file is too small it's likely an error page, delete it
    if total < 1024:
        os.remove(dest_path)
        raise Exception(f"Download failed - got {total} bytes (likely HTML error page)")

for filename, file_id in MODELS.items():
    dest = os.path.join(ML_DIR, filename)
    # Re-download if file doesn't exist or is too small (corrupted/HTML page)
    if os.path.exists(dest) and os.path.getsize(dest) < 1024:
        os.remove(dest)
        print(f"Removing corrupted {filename}")
    if not os.path.exists(dest):
        try:
            download_file(file_id, dest)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
    else:
        print(f"Already exists: {filename} ({os.path.getsize(dest)/(1024*1024):.1f} MB)")

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.url_map.strict_slashes = False

app.config["SQLALCHEMY_DATABASE_URI"] = (
    os.getenv("DATABASE_URL") or
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"]     = os.getenv("JWT_SECRET_KEY")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

db.init_app(app)
JWTManager(app)

CORS(app, resources={r"/api/*": {
    "origins": [
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "https://edds-teal.vercel.app",
    ],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)

# Serve uploaded images
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    response = send_from_directory(UPLOAD_DIR, filename)
    response.headers["Access-Control-Allow-Origin"] = os.getenv("FRONTEND_URL", "http://localhost:5173")
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    return response

app.register_blueprint(auth_bp,       url_prefix="/api/auth")
app.register_blueprint(patient_bp,    url_prefix="/api/patients")
app.register_blueprint(doctor_bp,     url_prefix="/api/doctors")
app.register_blueprint(prediction_bp, url_prefix="/api/predict")
app.register_blueprint(report_bp,     url_prefix="/api/reports")

limiter.limit("10 per minute")(auth_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "True") == "True", port=int(os.getenv("PORT", 5000)))
