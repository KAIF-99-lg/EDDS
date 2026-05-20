import tensorflow as tf
import os

print("TF version:", tf.__version__)

models = [
    ("pneumonia_model.h5", "pneumonia_new"),
    ("brain_model.h5",     "brain_new"),
    ("skin_model.h5",      "skin_new"),
    ("breast_model.h5",    "breast_new"),
]

for h5, out_name in models:
    h5_path  = os.path.join("ml_models", h5)
    out_path = os.path.join("ml_models", out_name)
    if not os.path.exists(h5_path):
        print(f"Not found: {h5_path}")
        continue
    if os.path.exists(out_path):
        print(f"Already exists: {out_name}")
        continue
    print(f"Converting {h5}...")
    m = tf.keras.models.load_model(h5_path, compile=False)
    tf.saved_model.save(m, out_path)
    print(f"Saved: {out_name}")

print("Done!")
