from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import gdown

load_dotenv()

# ── Download ML models ────────────────────────────────────────────────────────
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
    url = f"https://drive.google.com/uc?id={file_id}"
    gdown.download(url, dest_path, quiet=False, fuzzy=True)
    if not os.path.exists(dest_path) or os.path.getsize(dest_path) == 0:
        raise Exception("Download failed - file empty")
    print(f"Done: {os.path.basename(dest_path)} ({os.path.getsize(dest_path)/1024/1024:.2f} MB)")

force = os.getenv("FORCE_MODEL_DOWNLOAD") == "1"
for filename, file_id in MODELS.items():
    dest = os.path.join(ML_DIR, filename)
    if force and os.path.exists(dest):
        os.remove(dest)
    if not os.path.exists(dest):
        try:
            download_file(file_id, dest)
        except Exception as e:
            print(f"Failed: {filename} - {e}")
    else:
        size = os.path.getsize(dest)
        # Re-download .h5 and .pkl if suspiciously small
        if filename.endswith((".h5", ".pkl")) and size < 10000:
            os.remove(dest)
            print(f"Re-downloading {filename} (was {size} bytes)")
            try:
                download_file(file_id, dest)
            except Exception as e:
                print(f"Failed: {filename} - {e}")
        else:
            print(f"Exists: {filename} ({size/1024/1024:.1f} MB)")

# ── Load ML models into memory NOW (before any import of prediction_controller)
try:
    import tensorflow as tf
    TF_OK = True
except Exception:
    tf = None
    TF_OK = False

try:
    import pickle
    PKL_OK = True
except Exception:
    pickle = None
    PKL_OK = False

def _load_keras(name):
    path = os.path.join(ML_DIR, name)
    if TF_OK and os.path.exists(path) and os.path.getsize(path) > 10000:
        try:
            m = tf.keras.models.load_model(path, compile=False)
            print(f"Loaded: {name}")
            return m
        except Exception as e:
            print(f"Load failed {name}: {e}")
    return None

def _load_pickle(name):
    path = os.path.join(ML_DIR, name)
    if PKL_OK and os.path.exists(path) and os.path.getsize(path) > 100:
        try:
            m = pickle.load(open(path, "rb"))
            print(f"Loaded: {name}")
            return m
        except Exception as e:
            print(f"Load failed {name}: {e}")
    return None

# Load all models
LOADED_MODELS = {
    "pneumonia": _load_keras("pneumonia_model.h5"),
    "brain":     _load_keras("brain_model.h5"),
    "skin":      _load_keras("skin_model.h5"),
    "breast":    _load_keras("breast_model.h5"),
    "heart":     _load_pickle("heart_model.pkl"),
    "scaler":    _load_pickle("heart_scaler.pkl"),
}

# ── Inject models into prediction controller BEFORE importing routes ──────────
import controllers.prediction_controller as pc
pc.pneumonia_model = LOADED_MODELS["pneumonia"]
pc.brain_model     = LOADED_MODELS["brain"]
pc.skin_model      = LOADED_MODELS["skin"]
pc.breast_model    = LOADED_MODELS["breast"]
pc.heart_model     = LOADED_MODELS["heart"]
pc.heart_scaler    = LOADED_MODELS["scaler"]

# ── Flask app ─────────────────────────────────────────────────────────────────
from config.db import db
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.prediction_routes import prediction_bp
from routes.report_routes import report_bp

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
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

limiter = Limiter(
    get_remote_address, app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    response = send_from_directory(UPLOAD_DIR, filename)
    response.headers["Access-Control-Allow-Origin"] = "*"
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
