"""
Convert image_type_classifier .keras/.h5 to SavedModel format.
Run: python convert_image_classifier.py
"""
import os, json
import tensorflow as tf

ML_DIR = os.path.join(os.path.dirname(__file__), "ml_models")

# Try loading with keras.saving first (handles Keras 3 quantization_config)
model = None
for path in [
    os.path.join(ML_DIR, "image_type_classifier_v3.keras"),
    os.path.join(ML_DIR, "image_type_classifier_v2.keras"),
    os.path.join(ML_DIR, "image_type_classifier.h5"),
]:
    if not os.path.exists(path):
        continue
    try:
        import keras
        model = keras.saving.load_model(path, compile=False)
        print(f"Loaded via keras.saving: {os.path.basename(path)}")
        break
    except Exception as e1:
        try:
            model = tf.keras.models.load_model(path, compile=False)
            print(f"Loaded via tf.keras: {os.path.basename(path)}")
            break
        except Exception as e2:
            print(f"Failed {os.path.basename(path)}: {e2}")

if model is None:
    print("ERROR: Could not load any classifier model.")
    exit(1)

# Save as SavedModel
out_dir = os.path.join(ML_DIR, "image_type_classifier_saved")
tf.saved_model.save(model, out_dir)
print(f"Saved to: {out_dir}")

# Verify it loads back
m2 = tf.saved_model.load(out_dir)
print("Verification load OK:", m2)
