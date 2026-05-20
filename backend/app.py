import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import logging, pickle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

ML_DIR     = os.path.join(os.path.dirname(__file__), "ml_models")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(ML_DIR,     exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Load models ───────────────────────────────────────────────
try:
    import tensorflow as tf

    def load_keras(name):
        path = os.path.join(ML_DIR, name)
        if not os.path.exists(path):
            logger.error(f"Not found: {path}")
            return None
        try:
            logger.info(f"Loading {name}...")
            m = tf.keras.models.load_model(path, compile=False)
            logger.info(f"Loaded: {name}")
            return m
        except Exception as e:
            logger.error(f"Load failed {name}: {e}")
            return None

    def load_saved_model(name):
        path = os.path.join(ML_DIR, name)
        if not os.path.exists(path):
            logger.error(f"Not found: {path}")
            return None
        try:
            logger.info(f"Loading SavedModel {name}...")
            m = tf.saved_model.load(path)
            logger.info(f"Loaded: {name}")
            return m
        except Exception as e:
            logger.error(f"Load failed {name}: {e}")
            return None

    def load_pickle(name):
        path = os.path.join(ML_DIR, name)
        if os.path.exists(path) and os.path.getsize(path) > 100:
            try:
                return pickle.load(open(path, "rb"))
            except Exception as e:
                logger.error(f"Load failed {name}: {e}")
        return None

    import controllers.prediction_controller as pc

    # Try SavedModel first, fallback to .h5
    pc.pneumonia_model = load_saved_model("pneumonia_model_saved") or load_keras("pneumonia_model.h5")
    pc.brain_model     = load_saved_model("brain_model_saved")     or load_keras("brain_model.h5")
    pc.skin_model      = load_saved_model("skin_model_saved")      or load_keras("skin_model.h5")
    pc.breast_model    = load_saved_model("breast_model_saved")    or load_keras("breast_model.h5")
    pc.heart_model     = load_pickle("heart_model.pkl")
    pc.heart_scaler    = load_pickle("heart_scaler.pkl")
    logger.info("✅ All models loaded!")

except Exception as e:
    logger.error(f"Model loading error: {e}")

# ── Flask app ─────────────────────────────────────────────────
from routes.prediction_routes import prediction_bp

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"],
}})

limiter = Limiter(
    get_remote_address, app=app,
    default_limits=["200 per minute"],
    storage_uri="memory://",
)

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    r = send_from_directory(UPLOAD_DIR, filename)
    r.headers["Access-Control-Allow-Origin"] = "*"
    return r

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"}), 200

app.register_blueprint(prediction_bp, url_prefix="/api/predict")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
