import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ResultCard from "../../components/ResultCard";
import Alert from "../../components/Alert";

const initialForm = {
  age: "",
  gender: "Male",
  chestPain: "Asymptomatic",
  bp: "",
  cholesterol: "",
  maxHR: "",
};

const sampleProfiles = [
  {
    label: "Low Risk Sample",
    values: { age: "41", gender: "Female", chestPain: "Atypical Angina", bp: "118", cholesterol: "204", maxHR: "172" },
  },
  {
    label: "High Risk Sample",
    values: { age: "63", gender: "Male", chestPain: "Asymptomatic", bp: "150", cholesterol: "315", maxHR: "118" },
  },
];

const toDisplayResult = (data) => ({
  ...data,
  disease: data.disease || data.disease_type || "Heart Disease",
  riskScore: data.riskScore ?? data.risk_score,
  timestamp: data.timestamp || data.created_at,
});

const HeartDiseasePrediction = () => {
  const [form, setForm]       = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.age || !form.bp || !form.cholesterol || !form.maxHR) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Send 6 user fields — backend fills rest with defaults
      const data = await predictionService.predictHeartDisease(form);
      setResult(toDisplayResult(data));
    } catch (err) {
      setError(err.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <FiHeart className="text-red-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Heart Disease Prediction</h1>
          <p className="text-slate-500 text-sm">Enter basic clinical parameters for cardiovascular risk assessment</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-4">Clinical Parameters</h2>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          {/* Sample Buttons */}
          <div className="flex gap-2 mb-4">
            {sampleProfiles.map((s) => (
              <button key={s.label} onClick={() => { setForm(s.values); setResult(null); setError(""); }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
                {s.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age *</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="e.g. 52" className="input" />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="input">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="label">Chest Pain Type *</label>
                <select name="chestPain" value={form.chestPain} onChange={handleChange} className="input">
                  <option value="Typical Angina">Exercise-related chest pain</option>
                  <option value="Atypical Angina">Irregular chest pain</option>
                  <option value="Non-anginal">Non-heart chest pain (gas/muscle)</option>
                  <option value="Asymptomatic">No chest pain</option>
                </select>
              </div>
              <div>
                <label className="label">Blood Pressure (mmHg) *</label>
                <input name="bp" type="number" min="80" max="240" value={form.bp} onChange={handleChange} placeholder="e.g. 130" className="input" />
              </div>
              <div>
                <label className="label">Cholesterol (mg/dl) *</label>
                <input name="cholesterol" type="number" min="100" max="700" value={form.cholesterol} onChange={handleChange} placeholder="e.g. 250" className="input" />
              </div>
              <div>
                <label className="label">Max Heart Rate *</label>
                <input name="maxHR" type="number" min="60" max="240" value={form.maxHR} onChange={handleChange} placeholder="e.g. 150" className="input" />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Analyzing..." : "Predict Heart Disease Risk"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="bg-red-50 border border-red-100">
            <h3 className="font-semibold text-slate-800 mb-3">What We Analyze</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                "Age & gender demographics",
                "Blood pressure levels",
                "Cholesterol levels",
                "Chest pain classification",
                "Maximum heart rate",
                "AI ensemble model (RF + XGBoost)",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />{t}
                </li>
              ))}
            </ul>
          </Card>
          <ResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default HeartDiseasePrediction;
