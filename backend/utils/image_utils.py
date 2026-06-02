import os
import pickle
import numpy as np
from PIL import Image
import io

_clf = None
_le  = None

_LABELS = {
    "brain":  "Brain MRI scan",
    "chest":  "Chest X-ray",
    "breast": "Breast Ultrasound",
    "skin":   "Skin dermoscopy image",
}


def load_type_classifier(model_path, classes_path):
    """Load sklearn .pkl classifier. Falls back to rule-based if not found."""
    global _clf, _le
    pkl_path = os.path.join(os.path.dirname(model_path), "image_type_classifier.pkl")
    if os.path.exists(pkl_path):
        try:
            data = pickle.load(open(pkl_path, "rb"))
            _clf = data["model"]
            _le  = data["label_encoder"]
            print("Image type classifier (sklearn) loaded.")
            return
        except Exception as e:
            print(f"sklearn classifier load failed: {e}")
    print("image_type_classifier.pkl not found - using rule-based fallback.")


def _extract_features(arr: np.ndarray) -> np.ndarray:
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    color_var    = (np.mean(np.abs(r-g)) + np.mean(np.abs(r-b)) + np.mean(np.abs(g-b))) / 3.0
    brightness   = np.mean(arr)
    std          = np.std(arr)
    r_mean, g_mean, b_mean = np.mean(r), np.mean(g), np.mean(b)
    rg_diff      = np.mean(np.abs(r - g))
    rb_diff      = np.mean(np.abs(r - b))
    gb_diff      = np.mean(np.abs(g - b))
    dark_ratio   = np.mean(arr < 30)
    bright_ratio = np.mean(arr > 200)
    mid_ratio    = np.mean((arr >= 30) & (arr <= 200))
    h, w         = arr.shape[:2]
    aspect       = h / w
    r_hist = np.histogram(r, bins=8, range=(0, 255))[0] / r.size
    g_hist = np.histogram(g, bins=8, range=(0, 255))[0] / g.size
    b_hist = np.histogram(b, bins=8, range=(0, 255))[0] / b.size
    base = [color_var, brightness, std, r_mean, g_mean, b_mean,
            rg_diff, rb_diff, gb_diff, dark_ratio, bright_ratio, mid_ratio, aspect]
    return np.array(base + list(r_hist) + list(g_hist) + list(b_hist), dtype=np.float32).reshape(1, -1)


def _rule_based_classify(arr: np.ndarray) -> str:
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    color_var  = (np.mean(np.abs(r-g)) + np.mean(np.abs(r-b)) + np.mean(np.abs(g-b))) / 3.0
    brightness = np.mean(arr)
    h, w = arr.shape[:2]
    if color_var > 18.0:   return "skin"
    if brightness > 100:   return "chest"
    if h / w > 1.05:       return "breast"
    return "brain"


def validate_medical_image(image_file, expected_type):
    """
    Returns (is_valid, error_message).
    expected_type: 'brain' | 'chest' | 'breast' | 'skin'
    """
    image_file.seek(0)
    raw = image_file.read()
    image_file.seek(0)

    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB").resize((224, 224))
        arr = np.array(img, dtype=np.float32)
    except Exception as e:
        return False, f"Could not read image: {e}"

    if _clf is not None and _le is not None:
        try:
            feat       = _extract_features(arr)
            proba      = _clf.predict_proba(feat)[0]
            top_idx    = int(np.argmax(proba))
            top_conf   = float(proba[top_idx])
            predicted  = _le.inverse_transform([top_idx])[0]

            # Low confidence = not a medical image
            if top_conf < 0.5:
                return False, (
                    "This does not appear to be a valid medical image. "
                    "Please upload the correct scan."
                )
        except Exception as e:
            print(f"sklearn classifier error: {e} - falling back to rule-based")
            predicted = _rule_based_classify(arr)
    else:
        predicted = _rule_based_classify(arr)

    if predicted != expected_type:
        return False, (
            f"Wrong image type. Expected a {_LABELS[expected_type]}, "
            f"but this looks like a {_LABELS.get(predicted, predicted)}. "
            f"Please upload the correct scan."
        )
    return True, ""


def preprocess_image(image_file, target_size=(224, 224), mobilenet=False):
    img = Image.open(io.BytesIO(image_file.read())).convert("RGB").resize(target_size)
    arr = np.expand_dims(np.array(img, dtype=np.float32), axis=0)
    return (arr / 127.5) - 1.0 if mobilenet else arr / 255.0
