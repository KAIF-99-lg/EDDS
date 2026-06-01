import numpy as np
from PIL import Image
import io

_LABELS = {
    "brain":  "Brain MRI scan",
    "chest":  "Chest X-ray",
    "breast": "Breast Ultrasound",
    "skin":   "Skin dermoscopy image",
}


def load_type_classifier(model_path, classes_path):
    """No-op — rule-based classifier needs no model file."""
    print("✅ Using rule-based image type classifier (no ML model needed).")


def _rule_based_classify(img_rgb: np.ndarray):
    """
    Returns predicted type: 'brain' | 'chest' | 'breast' | 'skin'

    Rules:
      - skin   → colorful (high color variance)
      - chest  → grayscale + high brightness (lungs are bright/white)
      - breast → grayscale + low-mid brightness + often portrait aspect
      - brain  → grayscale + mid brightness + often square/landscape
    """
    r, g, b = img_rgb[:, :, 0], img_rgb[:, :, 1], img_rgb[:, :, 2]
    color_var = (np.mean(np.abs(r - g)) + np.mean(np.abs(r - b)) + np.mean(np.abs(g - b))) / 3.0
    brightness = np.mean(img_rgb)
    h, w = img_rgb.shape[:2]
    aspect = h / w  # >1 portrait, <1 landscape

    if color_var > 18.0:
        return "skin"

    # grayscale image
    if brightness > 100:
        return "chest"   # chest X-rays are bright
    if aspect > 1.05:
        return "breast"  # breast ultrasounds tend to be portrait
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
