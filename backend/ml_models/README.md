# ml_models/

Yahan apne trained model files rakhna:

- pneumonia_model.h5     → Chest X-ray pneumonia detection model
- brain_model.h5         → Brain MRI tumor detection model
- skin_model.h5          → Skin lesion cancer detection model
- breast_model.h5        → Mammography breast cancer detection model
- heart_model.pkl        → Heart disease risk prediction model (scikit-learn)

## Model Input Requirements

| Model | Input Size | Format |
|---|---|---|
| pneumonia_model.h5 | (1, 224, 224, 3) | Keras/TensorFlow |
| brain_model.h5 | (1, 224, 224, 3) | Keras/TensorFlow |
| skin_model.h5 | (1, 224, 224, 3) | Keras/TensorFlow |
| breast_model.h5 | (1, 224, 224, 3) | Keras/TensorFlow |
| heart_model.pkl | (1, 8 features) | scikit-learn |

## Heart Model Features Order
age, gender(0/1), chestPain(0-3), bp, cholesterol, bloodSugar(0/1), maxHR, exerciseAngina(0/1)
