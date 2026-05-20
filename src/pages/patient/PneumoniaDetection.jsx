import { useState } from "react";
import { FiActivity } from "react-icons/fi";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ImageUpload from "../../components/ImageUpload";
import ResultCard from "../../components/ResultCard";
import Alert from "../../components/Alert";

const toDisplayResult = (data) => ({
  ...data,
  disease: "Pneumonia",
  confidence: data.confidence,
  timestamp: data.timestamp || data.created_at,
});

const generateSampleImage = (type) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 224; canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, 224, 224);
    if (type === "normal") {
      ctx.fillStyle = "#444";
      ctx.beginPath(); ctx.ellipse(80, 112, 45, 70, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(144, 112, 45, 70, 0.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#444";
      ctx.beginPath(); ctx.ellipse(80, 112, 45, 70, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(144, 112, 45, 70, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath(); ctx.ellipse(90, 130, 25, 20, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(150, 100, 20, 15, -0.2, 0, Math.PI * 2); ctx.fill();
    }
    canvas.toBlob((blob) =>
      resolve(new File([blob], `sample_${type}.png`, { type: "image/png" }))
    );
  });

const samples = [
  { type: "normal",    label: "Normal Sample" },
  { type: "pneumonia", label: "Pneumonia Sample" },
];

const PneumoniaDetection = () => {
  const [image, setImage]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [activeSample, setActiveSample] = useState(null);

  const loadSample = async (type) => {
    const file = await generateSampleImage(type);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveSample(type);
    setResult(null); setError("");
  };

  const handleFileSelect = (file) => {
    setImage(file);
    setActiveSample(null);
    if (!file) setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please upload a chest X-ray image."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await predictionService.predictPneumonia(image);
      setResult(toDisplayResult(data));
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiActivity className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pneumonia Detection</h1>
          <p className="text-slate-500 text-sm">Upload chest X-ray — AI detects pneumonia</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">Upload Chest X-Ray</h2>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Test Samples:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button key={s.type} onClick={() => loadSample(s.type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeSample === s.type
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                  }`}>
                  🧪 {s.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              onFileSelect={handleFileSelect}
              label="Chest X-Ray (JPEG/PNG)"
              externalPreview={previewUrl}
              externalFileName={image?.name || ""}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Analyzing X-Ray..." : "Detect Pneumonia"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="bg-blue-50 border border-blue-100">
            <h3 className="font-semibold text-slate-800 mb-3">Detection Classes</h3>
            <div className="space-y-2">
              {[
                { label: "Negative", desc: "No pneumonia detected",       color: "green" },
                { label: "Positive", desc: "Pneumonia detected in X-ray",  color: "red" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 bg-white rounded-xl p-3">
                  <span className={`w-3 h-3 rounded-full bg-${c.color}-500 flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                    <p className="text-xs text-slate-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-white rounded-xl border border-blue-100">
              <p className="text-xs text-slate-500 font-medium">Model</p>
              <p className="text-sm text-slate-700 mt-0.5">MobileNetV2 — Chest X-Ray Classification</p>
            </div>
          </Card>
          <ResultCard result={result} loading={loading} imageUrl={previewUrl} />
        </div>
      </div>
    </div>
  );
};

export default PneumoniaDetection;
