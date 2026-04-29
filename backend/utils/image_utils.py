import numpy as np
from PIL import Image
import io

def preprocess_image(image_file, target_size=(224, 224), mobilenet=False):
    img = Image.open(io.BytesIO(image_file.read())).convert("RGB")
    img = img.resize(target_size)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    if mobilenet:
        # MobileNetV2 expects [-1, 1] range
        arr = (arr / 127.5) - 1.0
    else:
        arr = arr / 255.0
    return arr
