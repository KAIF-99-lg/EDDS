"""
Train a sklearn RandomForest image type classifier.
Uses only PIL + NumPy + sklearn — no TensorFlow needed.
Saves: ml_models/image_type_classifier.pkl
"""
import os, pickle
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder

UPLOADS = os.path.join(os.path.dirname(__file__), "uploads")
OUT     = os.path.join(os.path.dirname(__file__), "ml_models", "image_type_classifier.pkl")


def extract_features(img_path):
    img = Image.open(img_path).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    color_var    = (np.mean(np.abs(r-g)) + np.mean(np.abs(r-b)) + np.mean(np.abs(g-b))) / 3.0
    brightness   = np.mean(arr)
    std          = np.std(arr)
    r_mean       = np.mean(r)
    g_mean       = np.mean(g)
    b_mean       = np.mean(b)
    rg_diff      = np.mean(np.abs(r - g))
    rb_diff      = np.mean(np.abs(r - b))
    gb_diff      = np.mean(np.abs(g - b))
    dark_ratio   = np.mean(arr < 30)
    bright_ratio = np.mean(arr > 200)
    mid_ratio    = np.mean((arr >= 30) & (arr <= 200))
    h, w         = arr.shape[:2]
    aspect       = h / w

    # Histogram features (8 bins per channel)
    r_hist = np.histogram(r, bins=8, range=(0, 255))[0] / r.size
    g_hist = np.histogram(g, bins=8, range=(0, 255))[0] / g.size
    b_hist = np.histogram(b, bins=8, range=(0, 255))[0] / b.size

    base = [color_var, brightness, std, r_mean, g_mean, b_mean,
            rg_diff, rb_diff, gb_diff, dark_ratio, bright_ratio, mid_ratio, aspect]
    return np.array(base + list(r_hist) + list(g_hist) + list(b_hist), dtype=np.float32)


# ── Collect data ──────────────────────────────────────────────
X, y = [], []
prefix_map = {"brain": "brain", "breast": "breast", "pneumonia": "chest", "skin": "skin"}

for fname in os.listdir(UPLOADS):
    for prefix, label in prefix_map.items():
        if fname.startswith(prefix):
            try:
                feat = extract_features(os.path.join(UPLOADS, fname))
                X.append(feat)
                y.append(label)
            except Exception as e:
                print(f"Skip {fname}: {e}")
            break

X = np.array(X)
le = LabelEncoder()
y_enc = le.fit_transform(y)

print(f"Samples: {len(X)}")
for cls in le.classes_:
    print(f"  {cls}: {sum(1 for lbl in y if lbl == cls)}")

# ── Train ─────────────────────────────────────────────────────
clf = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, n_jobs=-1)
scores = cross_val_score(clf, X, y_enc, cv=3, scoring="accuracy")
print(f"CV Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

clf.fit(X, y_enc)

# ── Save ──────────────────────────────────────────────────────
with open(OUT, "wb") as f:
    pickle.dump({"model": clf, "label_encoder": le}, f)

print(f"✅ Saved: {OUT}")
print(f"   Classes: {list(le.classes_)}")
