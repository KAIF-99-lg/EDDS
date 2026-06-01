import { useState, useEffect, useContext, createContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = authService.getCurrentUser();
    if (!token || !stored) { setReady(true); return; }
    // verify token before trusting localStorage
    fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api") + "/patients/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) return res.json();
      authService.logout();
      return null;
    }).then((profile) => {
      if (profile) setUser({ ...stored, ...profile });
    }).catch(() => {
      authService.logout();
    })
    .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const signup = async (userData) => {
    return await authService.signup(userData);
  };

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
