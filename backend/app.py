from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

ML_DIR     = os.path.join(os.path.dirname(__file__), "ml_models")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(ML_DIR,     exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Download models from HF Model Hub ────────────────────────────────────────
HF_REPO = "kqif235/medai-backend"

HF_FILES = [
    "brain_model.h5",
    "breast_model.h5",
    "pneumonia_model.h5",
    "skin_model.h5",
    "heart_model.pkl",
    "heart_scaler.pkl",
    "breast_classes.json",
    "brain_classes.json",
]

try:
    from huggingface_hub import hf_hub_download
    for filename in HF_FILES:
        dest = os.path.join(ML_DIR, filename)
        if not os.path.exists(dest) or os.path.getsize(dest) < 100:
            logger.info(f"Downloading {filename} from HF...")
            hf_hub_download(
                repo_id=HF_REPO,
                filename=filename,
                local_dir=ML_DIR,
                repo_type="model",
            )
            logger.info(f"Downloaded: {filename}")
        else:
            logger.info(f"Already exists: {filename}")
except Exception as e:
    logger.error(f"HF download error: {e}")

# ── Load models ───────────────────────────────────────────────────────────────
import pickle
import tensorflow as tf
import controllers.prediction_controller as pc

def load_keras(name):
    path = os.path.join(ML_DIR, name)
    if os.path.exists(path):
        try:
            logger.info(f"Loading {name}...")
            m = tf.keras.models.load_model(path)
            logger.info(f"Loaded: {name}")
            return m
        except Exception as e:
            logger.error(f"Load failed {name}: {e}")
    else:
        logger.error(f"Not found: {path}")
    return None

def load_pickle(name):
    path = os.path.join(ML_DIR, name)
    if os.path.exists(path) and os.path.getsize(path) > 100:
        try:
            return pickle.load(open(path, "rb"))
        except Exception as e:
            logger.error(f"Load failed {name}: {e}")
    return None

pc.pneumonia_model = load_keras("pneumonia_model.h5")
pc.brain_model     = load_keras("brain_model.h5")
pc.skin_model      = load_keras("skin_model.h5")
pc.breast_model    = load_keras("breast_model.h5")
pc.heart_model     = load_pickle("heart_model.pkl")
pc.heart_scaler    = load_pickle("heart_scaler.pkl")
logger.info("✅ All models loaded!")

# ── Flask app ─────────────────────────────────────────────────────────────────
from config.db import db
from routes.auth_routes       import auth_bp
from routes.patient_routes    import patient_bp
from routes.doctor_routes     import doctor_bp
from routes.prediction_routes import prediction_bp
from routes.report_routes     import report_bp

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

CORS(app, supports_credentials=True, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}})

limiter = Limiter(
    get_remote_address, app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    response = send_from_directory(UPLOAD_DIR, filename)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "models_loaded": True}), 200

app.register_blueprint(auth_bp,       url_prefix="/api/auth")
app.register_blueprint(patient_bp,    url_prefix="/api/patients")
app.register_blueprint(doctor_bp,     url_prefix="/api/doctors")
app.register_blueprint(prediction_bp, url_prefix="/api/predict")
app.register_blueprint(report_bp,     url_prefix="/api/reports")

limiter.limit("10 per minute")(auth_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
