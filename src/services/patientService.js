import { apiRequest } from "./api";

export const patientService = {
  getMyProfile: () => apiRequest("/patients/me"),

  updateMyProfile: (data) =>
    apiRequest("/patients/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMyReports: () => apiRequest("/reports"),
};
