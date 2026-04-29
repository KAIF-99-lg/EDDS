import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./layouts/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PneumoniaDetection from "./pages/patient/PneumoniaDetection";
import HeartDiseasePrediction from "./pages/patient/HeartDiseasePrediction";
import BrainTumorDetection from "./pages/patient/BrainTumorDetection";
import SkinCancerDetection from "./pages/patient/SkinCancerDetection";
import BreastCancerDetection from "./pages/patient/BreastCancerDetection";
import MedicalReports from "./pages/patient/MedicalReports";
import PredictionHistory from "./pages/patient/PredictionHistory";
import PatientProfile from "./pages/patient/PatientProfile";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientManagement from "./pages/doctor/PatientManagement";
import PatientMonitoring from "./pages/doctor/PatientMonitoring";
import PatientDetails from "./pages/doctor/PatientDetails";
import ReportReview from "./pages/doctor/ReportReview";
import Alerts from "./pages/doctor/Alerts";
import {
  DoctorPneumoniaDetection,
  DoctorHeartDiseasePrediction,
  DoctorBrainTumorDetection,
  DoctorSkinCancerDetection,
  DoctorBreastCancerDetection,
} from "./pages/doctor/DoctorDetectionPages";

const PatientLayout = ({ children }) => (
  <ProtectedRoute role="patient">
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const DoctorLayout = ({ children }) => (
  <ProtectedRoute role="doctor">
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<PatientLayout><PatientDashboard /></PatientLayout>} />
          <Route path="/patient/pneumonia" element={<PatientLayout><PneumoniaDetection /></PatientLayout>} />
          <Route path="/patient/heart" element={<PatientLayout><HeartDiseasePrediction /></PatientLayout>} />
          <Route path="/patient/brain-tumor" element={<PatientLayout><BrainTumorDetection /></PatientLayout>} />
          <Route path="/patient/skin-cancer" element={<PatientLayout><SkinCancerDetection /></PatientLayout>} />
          <Route path="/patient/breast-cancer" element={<PatientLayout><BreastCancerDetection /></PatientLayout>} />
          <Route path="/patient/reports" element={<PatientLayout><MedicalReports /></PatientLayout>} />
          <Route path="/patient/history" element={<PatientLayout><PredictionHistory /></PatientLayout>} />
          <Route path="/patient/profile" element={<PatientLayout><PatientProfile /></PatientLayout>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<DoctorLayout><DoctorDashboard /></DoctorLayout>} />
          <Route path="/doctor/patients" element={<DoctorLayout><PatientManagement /></DoctorLayout>} />
          <Route path="/doctor/monitoring" element={<DoctorLayout><PatientMonitoring /></DoctorLayout>} />
          <Route path="/doctor/patient/:id" element={<DoctorLayout><PatientDetails /></DoctorLayout>} />
          <Route path="/doctor/reports" element={<DoctorLayout><ReportReview /></DoctorLayout>} />
          <Route path="/doctor/alerts" element={<DoctorLayout><Alerts /></DoctorLayout>} />
          <Route path="/doctor/pneumonia" element={<DoctorLayout><DoctorPneumoniaDetection /></DoctorLayout>} />
          <Route path="/doctor/heart" element={<DoctorLayout><DoctorHeartDiseasePrediction /></DoctorLayout>} />
          <Route path="/doctor/brain-tumor" element={<DoctorLayout><DoctorBrainTumorDetection /></DoctorLayout>} />
          <Route path="/doctor/skin-cancer" element={<DoctorLayout><DoctorSkinCancerDetection /></DoctorLayout>} />
          <Route path="/doctor/breast-cancer" element={<DoctorLayout><DoctorBreastCancerDetection /></DoctorLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
