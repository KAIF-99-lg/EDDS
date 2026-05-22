import { apiRequest } from "./api";

export const patientService = {
  getMyProfile: async () => {
    return await apiRequest("/patients/me");
  },
  updateMyProfile: async (data) => {
    return await apiRequest("/patients/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  getMyReports: async () => {
    return await apiRequest("/reports/mine");
  },
};
