import { apiRequest } from "./api";

export const authService = {
  login: async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  googleLogin: async (credential) => {
    const data = await apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  signup: async (userData) => {
    return await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
};
