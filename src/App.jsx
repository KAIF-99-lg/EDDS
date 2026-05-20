import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import BrainTumorDetection from "./pages/patient/BrainTumorDetection";
import BreastCancerDetection from "./pages/patient/BreastCancerDetection";
import PneumoniaDetection from "./pages/patient/PneumoniaDetection";
import SkinCancerDetection from "./pages/patient/SkinCancerDetection";
import HeartDiseasePrediction from "./pages/patient/HeartDiseasePrediction";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<DashboardLayout />}>
          <Route path="/brain-tumor" element={<BrainTumorDetection />} />
          <Route path="/breast-cancer" element={<BreastCancerDetection />} />
          <Route path="/pneumonia" element={<PneumoniaDetection />} />
          <Route path="/skin-cancer" element={<SkinCancerDetection />} />
          <Route path="/heart" element={<HeartDiseasePrediction />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
