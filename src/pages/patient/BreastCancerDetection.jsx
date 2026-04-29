import { useState } from "react";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ImageUpload from "../../components/ImageUpload";
import ResultCard from "../../components/ResultCard";
import Alert from "../../components/Alert";

const toDisplayResult = (data) => ({
  ...data,
  disease: "Breast Cancer",
  confidence: data.confidence,
  timestamp: data.timestamp || data.created_at,
});

const SAMPLE_RESULTS = {
  normal:    { disease: "Breast Cancer", result: "Normal",    confidence: 94.3, recommendation: "No abnormality detected. Routine annual screening recommended.", timestamp: new Date().toISOString() },
  benign:    { disease: "Breast Cancer", result: "Benign",    confidence: 88.7, recommendation: "Benign finding. Regular follow-up and monitoring advised.",        timestamp: new Date().toISOString() },
  malignant: { disease: "Breast Cancer", result: "Malignant", confidence: 91.2, recommendation: "Urgent oncology consultation required. Further biopsy and imaging needed.", timestamp: new Date().toISOString() },
};

const generateSampleImage = (type) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 224; canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (type === "normal") {
      ctx.fillStyle = "#888"; ctx.fillRect(0, 0, 224, 224);
      const g = ctx.createRadialGradient(112, 112, 20, 112, 112, 90);
      g.addColorStop(0, "#aaa"); g.addColorStop(1, "#666");
      ctx.fillStyle = g; ctx.beginPath();
      ctx.ellipse(112, 112, 70, 80, 0, 0, Math.PI * 2); ctx.fill();
    } else if (type === "benign") {
      ctx.fillStyle = "#555"; ctx.fillRect(0, 0, 224, 224);
      const g = ctx.createRadialGradient(100, 100, 5, 100, 100, 50);
      g.addColorStop(0, "#ddd"); g.addColorStop(1, "#777");
      ctx.fillStyle = g; ctx.beginPath();
      ctx.ellipse(100, 100, 45, 48, 0.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#444"; ctx.fillRect(0, 0, 224, 224);
      ctx.fillStyle = "#ccc"; ctx.beginPath();
      ctx.moveTo(90, 70); ctx.lineTo(140, 65); ctx.lineTo(155, 110);
      ctx.lineTo(145, 145); ctx.lineTo(100, 150); ctx.lineTo(75, 120);
      ctx.closePath(); ctx.fill();
    }
    canvas.toBlob((blob) => resolve(new File([blob], `sample_${type}.png`, { type: "image/png" })));
  });

const samples = [
  { label: "Normal Sample",    type: "normal",    desc: "Healthy breast tissue — no abnormality" },
  { label: "Benign Sample",    type: "benign",    desc: "Smooth round mass — likely non-cancerous" },
  { label: "Malignant Sample", type: "malignant", desc: "Irregular mass — possible cancer" },
];

const BreastCancerDetection = () => {
  const [image, setImage]           = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState("");
  const [activeSample, setActiveSample] = useState(null);

  const loadSample = async (type) => {
    const file = await generateSampleImage(type);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveSample(type);
    setResult(null);
    setError("");
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (file) => {
    setImage(file);
    setActiveSample(null);
    if (!file) setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please upload a breast ultrasound image."); return; }
    // Sample image — show mock result instantly
    if (activeSample) {
      setResult({ ...SAMPLE_RESULTS[activeSample], timestamp: new Date().toISOString() });
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await predictionService.predictBreastCancer(image);
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
        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
          <span className="text-pink-600 text-xl">🎗️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Breast Cancer Detection</h1>
          <p className="text-slate-500 text-sm">Upload breast ultrasound image — AI detects benign, malignant, or normal</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">Upload Ultrasound Image</h2>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          {/* Sample Buttons */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Test Samples:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button key={s.type} onClick={() => loadSample(s.type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeSample === s.type
                      ? "border-pink-500 bg-pink-100 text-pink-800"
                      : "border-pink-200 hover:border-pink-400 hover:bg-pink-50 text-pink-700"
                  }`}>
                  🧪 {s.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              onFileSelect={handleFileSelect}
              label="Breast Ultrasound Image (JPEG/PNG)"
              externalPreview={previewUrl}
              externalFileName={image?.name || ""}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Analyzing..." : "Detect Breast Cancer"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="bg-pink-50 border border-pink-100">
            <h3 className="font-semibold text-slate-800 mb-3">Detection Classes</h3>
            <div className="space-y-2">
              {[
                { label: "Normal", desc: "No abnormality detected", color: "green" },
                { label: "Benign", desc: "Non-cancerous mass present", color: "yellow" },
                { label: "Malignant", desc: "Cancerous mass detected", color: "red" },
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
            <div className="mt-3 p-3 bg-white rounded-xl border border-pink-100">
              <p className="text-xs text-slate-500 font-medium">Model</p>
              <p className="text-sm text-slate-700 mt-0.5">ResNet50V2 — 85% accuracy on ultrasound images</p>
            </div>
          </Card>
          <ResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default BreastCancerDetection;
