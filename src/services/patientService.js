import { apiRequest } from "./api";

export const patientService = {
  getMyProfile: async () => {
    return await apiRequest("/patients/me");
  },

  getAllPatients: async () => {
    return await apiRequest("/patients");
  },

  getPatientById: async (id) => {
    return await apiRequest(`/patients/${id}`);
  },

  addPatient: async (data) => {
    return await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePatient: async (id, data) => {
    return await apiRequest(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePatient: async (id) => {
    return await apiRequest(`/patients/${id}`, { method: "DELETE" });
  },

  getPatientReports: async (patientId) => {
    return await apiRequest(`/reports/patient/${patientId}`);
  },

  getMyReports: async () => {
    return await apiRequest("/reports/mine");
  },
};
