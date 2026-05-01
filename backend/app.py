from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os, zipfile, threading

load_dotenv()

ML_DIR     = os.path.join(os.path.dirname(__file__), "ml_models")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(ML_DIR,     exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Flask app first (so port binds immediately) ───────────────────────────────
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
    return jsonify({"status": "ok", "models_loaded": _models_ready}), 200

app.register_blueprint(auth_bp,       url_prefix="/api/auth")
app.register_blueprint(patient_bp,    url_prefix="/api/patients")
app.register_blueprint(doctor_bp,     url_prefix="/api/doctors")
app.register_blueprint(prediction_bp, url_prefix="/api/predict")
app.register_blueprint(report_bp,     url_prefix="/api/reports")

limiter.limit("10 per minute")(auth_bp)

with app.app_context():
    db.create_all()

# ── Download + load models in background ─────────────────────────────────────
_models_ready = False

MODELS = {
    "brain_model_saved.zip":     "1PpYxO-QlUmK2FCAXFnnvSB370QAwGnao",
    "breast_model_saved.zip":    "1XsMBAq3AVPHExSrMdZzr9BNa0fLCkx18",
    "pneumonia_model_saved.zip": "155IpfoltHsrOv9NOk_WHZudChSmPTK4E",
    "skin_model_saved.zip":      "1Q8K_qt-iBXWmZ7Vb8FekiVNLASjsDoqK",
    "heart_scaler.pkl":          "1SN9cjfItVbiGO6WEkohVoqlfcq-oV_Ub",
    "heart_model.pkl":           "1KL1m745h1wFlAL-GBvpQvBsPh3gQV_Ci",
    "breast_classes.json":       "1R0uAhH2p2rmuF37937kh8VUkod05EJOd",
    "brain_classes.json":        "1oxfQMkCBiMK-zemXZ2TffA261PZ4L-nO",
}

def _setup_models():
    global _models_ready
    try:
        import gdown

        for filename, file_id in MODELS.items():
            dest = os.path.join(ML_DIR, filename)
            if filename.endswith(".zip"):
                folder = os.path.join(ML_DIR, filename.replace(".zip", ""))
                if not os.path.exists(folder):
                    print(f"Downloading {filename}...")
                    gdown.download(f"https://drive.google.com/uc?id={file_id}", dest, quiet=False, fuzzy=True)
                    with zipfile.ZipFile(dest, "r") as z:
                        z.extractall(ML_DIR)
                    os.remove(dest)
                    print(f"Extracted {filename}")
            else:
                if not os.path.exists(dest) or os.path.getsize(dest) < 100:
                    print(f"Downloading {filename}...")
                    gdown.download(f"https://drive.google.com/uc?id={file_id}", dest, quiet=False, fuzzy=True)

        import pickle
        import tensorflow as tf
        import controllers.prediction_controller as pc

        def load_keras(name):
            path = os.path.join(ML_DIR, name)
            if os.path.exists(path):
                try:
                    m = tf.keras.models.load_model(path)
                    print(f"Loaded: {name}")
                    return m
                except Exception as e:
                    print(f"Load failed {name}: {e}")
            return None

        def load_pickle(name):
            path = os.path.join(ML_DIR, name)
            if os.path.exists(path) and os.path.getsize(path) > 100:
                try:
                    return pickle.load(open(path, "rb"))
                except Exception as e:
                    print(f"Load failed {name}: {e}")
            return None

        pc.pneumonia_model = load_keras("pneumonia_model_saved")
        pc.brain_model     = load_keras("brain_model_saved")
        pc.skin_model      = load_keras("skin_model_saved")
        pc.breast_model    = load_keras("breast_model_saved")
        pc.heart_model     = load_pickle("heart_model.pkl")
        pc.heart_scaler    = load_pickle("heart_scaler.pkl")

        _models_ready = True
        print("✅ All models loaded!")

    except Exception as e:
        print(f"Model setup failed: {e}")

threading.Thread(target=_setup_models, daemon=True).start()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
