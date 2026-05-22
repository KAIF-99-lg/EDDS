import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/user/UserDashboard";
import BrainTumorDetection from "./pages/patient/BrainTumorDetection";
import BreastCancerDetection from "./pages/patient/BreastCancerDetection";
import PneumoniaDetection from "./pages/patient/PneumoniaDetection";
import SkinCancerDetection from "./pages/patient/SkinCancerDetection";
import HeartDiseasePrediction from "./pages/patient/HeartDiseasePrediction";
import PredictionHistory from "./pages/patient/PredictionHistory";
import MedicalReports from "./pages/patient/MedicalReports";
import PatientProfile from "./pages/patient/PatientProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout showUser />}>
              <Route path="/dashboard"     element={<UserDashboard />} />
              <Route path="/brain-tumor"   element={<BrainTumorDetection />} />
              <Route path="/breast-cancer" element={<BreastCancerDetection />} />
              <Route path="/pneumonia"     element={<PneumoniaDetection />} />
              <Route path="/skin-cancer"   element={<SkinCancerDetection />} />
              <Route path="/heart"         element={<HeartDiseasePrediction />} />
              <Route path="/history"       element={<PredictionHistory />} />
              <Route path="/reports"       element={<MedicalReports />} />
              <Route path="/profile"       element={<PatientProfile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
