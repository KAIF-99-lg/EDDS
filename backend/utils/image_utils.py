import os
import json
import numpy as np
from PIL import Image
import io

# Loaded once at startup by app.py
_type_model   = None
_type_classes = None  # e.g. {"brain": 0, "breast": 1, "chest": 2, "skin": 3}


def load_type_classifier(model_path, classes_path):
    """Call this from app.py after TF is imported."""
    global _type_model, _type_classes
    try:
        import tensorflow as tf
        if os.path.exists(model_path) and os.path.exists(classes_path):
            _type_model = tf.keras.models.load_model(model_path, compile=False)
            with open(classes_path) as f:
                idx_to_class = {v: k for k, v in json.load(f).items()}
            _type_classes = idx_to_class
            print(f"✅ Image type classifier loaded. Classes: {idx_to_class}")
        else:
            print("⚠️  Image type classifier not found — skipping image type validation.")
    except Exception as e:
        print(f"⚠️  Could not load image type classifier: {e}")


# Maps each endpoint's expected class to the label in the classifier
_EXPECTED = {
    "brain":  "brain",
    "chest":  "chest",
    "breast": "breast",
    "skin":   "skin",
}


def validate_medical_image(image_file, expected_type):
    """
    Returns (is_valid, error_message).
    expected_type: 'brain' | 'chest' | 'breast' | 'skin'
    Falls back to grayscale/color heuristic if classifier not loaded.
    """
    image_file.seek(0)
    raw = image_file.read()
    image_file.seek(0)

    # ── Classifier-based validation ───────────────────────
    if _type_model is not None and _type_classes is not None:
        try:
            import tensorflow as tf
            from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
            img = Image.open(io.BytesIO(raw)).convert("RGB").resize((224, 224))
            arr = np.array(img, dtype=np.float32)
            arr = preprocess_input(np.expand_dims(arr, axis=0))
            preds     = _type_model.predict(arr, verbose=0)[0]
            top_idx   = int(np.argmax(preds))
            top_label = _type_classes[top_idx]
            top_conf  = float(preds[top_idx])
            expected  = _EXPECTED[expected_type]
            if top_label != expected:
                labels = {
                    "brain":  "Brain MRI scan",
                    "chest":  "Chest X-ray",
                    "breast": "Breast Ultrasound",
                    "skin":   "Skin dermoscopy image",
                }
                return False, (
                    f"Wrong image type. This tool expects a {labels[expected]}, "
                    f"but the uploaded image looks like a {labels.get(top_label, top_label)} "
                    f"({top_conf*100:.0f}% confidence). Please upload the correct scan."
                )
            return True, ""
        except Exception as e:
            print(f"Type classifier error: {e} — falling back to heuristic")

    # ── Fallback: grayscale/color heuristic ───────────────
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        arr = np.array(img, dtype=np.float32)
        r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
        color_var = (np.mean(np.abs(r-g)) + np.mean(np.abs(r-b)) + np.mean(np.abs(g-b))) / 3.0
        is_gray = color_var < 15.0
        if expected_type == "skin" and is_gray:
            return False, "This tool expects a color skin dermoscopy image. Please upload the correct image."
        if expected_type != "skin" and not is_gray:
            return False, "This tool expects a grayscale medical scan (MRI/X-ray/Ultrasound). Please upload the correct image."
    except Exception as e:
        return False, f"Could not read image: {e}"

    return True, ""


def preprocess_image(image_file, target_size=(224, 224), mobilenet=False):
    img = Image.open(io.BytesIO(image_file.read())).convert("RGB")
    img = img.resize(target_size)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    if mobilenet:
        arr = (arr / 127.5) - 1.0
    else:
        arr = arr / 255.0
    return arr
