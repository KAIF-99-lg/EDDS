import { apiRequest, uploadFile } from "./api";

export const predictionService = {
  predictPneumonia: async (imageFile, patientData) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (patientData) formData.append("patientData", JSON.stringify(patientData));
    return await uploadFile("/predict/pneumonia", formData);
  },

  predictHeartDisease: async (data) => {
    return await apiRequest("/predict/heart", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  predictBrainTumor: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return await uploadFile("/predict/brain-tumor", formData);
  },

  predictSkinCancer: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return await uploadFile("/predict/skin-cancer", formData);
  },

  predictBreastCancer: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    return await uploadFile("/predict/breast-cancer", formData);
  },

  getPredictionHistory: async (patientId) => {
    return await apiRequest(`/predict/history/${patientId}`);
  },

  getMyHistory: async () => {
    return await apiRequest("/predict/history/mine");
  },
};
