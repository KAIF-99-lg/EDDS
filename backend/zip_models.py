import zipfile, os

base = os.path.join(os.path.dirname(__file__), "ml_models")

for name in ["pneumonia_new", "brain_new", "skin_new", "breast_new"]:
    folder = os.path.join(base, name)
    out    = os.path.join(base, f"{name}.zip")
    if not os.path.exists(folder):
        print(f"Not found: {folder}")
        continue
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(folder):
            for f in files:
                filepath = os.path.join(root, f)
                arcname  = os.path.relpath(filepath, base)
                z.write(filepath, arcname)
    size = os.path.getsize(out) / 1024 / 1024
    print(f"Zipped: {name}.zip ({size:.1f} MB)")
