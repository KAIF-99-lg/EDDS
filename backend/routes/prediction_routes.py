from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.prediction_controller import (
    predict_pneumonia, predict_heart, predict_brain,
    predict_skin, predict_breast, get_history, get_my_history
)

prediction_bp = Blueprint("prediction", __name__)

prediction_bp.post("/pneumonia")(jwt_required()(predict_pneumonia))
prediction_bp.post("/heart")(jwt_required()(predict_heart))
prediction_bp.post("/brain-tumor")(jwt_required()(predict_brain))
prediction_bp.post("/skin-cancer")(jwt_required()(predict_skin))
prediction_bp.post("/breast-cancer")(jwt_required()(predict_breast))
prediction_bp.get("/history/mine")(jwt_required()(get_my_history))
prediction_bp.get("/history/<patient_id>")(jwt_required()(get_history))
