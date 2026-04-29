import { useState } from "react";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ImageUpload from "../../components/ImageUpload";
import ResultCard from "../../components/ResultCard";
import Alert from "../../components/Alert";

const toDisplayResult = (data) => ({
  ...data,
  disease: "Skin Cancer",
  confidence: data.confidence,
  timestamp: data.timestamp || data.created_at,
});

const SAMPLE_RESULTS = {
  benign:    { disease: "Skin Cancer", result: "Benign",           confidence: 91.4, recommendation: "Benign lesion. Monitor for changes. Annual skin check recommended.",         timestamp: new Date().toISOString() },
  malignant: { disease: "Skin Cancer", result: "Melanoma Detected",confidence: 88.6, recommendation: "Immediate dermatology referral required. Biopsy recommended.",               timestamp: new Date().toISOString() },
};

const samples = [
  { type: "benign",    label: "Benign Sample",    desc: "Non-cancerous skin lesion" },
  { type: "malignant", label: "Malignant Sample",  desc: "Possible melanoma" },
];

const SkinCancerDetection = () => {
  const [image, setImage]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [activeSample, setActiveSample] = useState(null);

  const loadSample = (type) => {
    const canvas = document.createElement("canvas");
    canvas.width = 224; canvas.height = 224;
    const ctx = canvas.getContext("2d");
    if (type === "benign") {
      ctx.fillStyle = "#c8a882"; ctx.fillRect(0, 0, 224, 224);
      const g = ctx.createRadialGradient(112, 112, 5, 112, 112, 40);
      g.addColorStop(0, "#a0724a"); g.addColorStop(1, "#c8a882");
      ctx.fillStyle = g; ctx.beginPath();
      ctx.ellipse(112, 112, 35, 38, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#c8a882"; ctx.fillRect(0, 0, 224, 224);
      ctx.fillStyle = "#3a1a0a";
      ctx.beginPath();
      ctx.moveTo(90, 80); ctx.lineTo(145, 75); ctx.lineTo(155, 120);
      ctx.lineTo(140, 150); ctx.lineTo(95, 148); ctx.lineTo(72, 115);
      ctx.closePath(); ctx.fill();
    }
    canvas.toBlob((blob) => {
      const file = new File([blob], `sample_${type}.png`, { type: "image/png" });
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setActiveSample(type);
      setResult(null); setError("");
    });
  };

  const handleFileSelect = (file) => {
    setImage(file);
    setActiveSample(null);
    if (!file) setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please upload a skin lesion image."); return; }
    if (activeSample) {
      setResult({ ...SAMPLE_RESULTS[activeSample], timestamp: new Date().toISOString() });
      return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await predictionService.predictSkinCancer(image);
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
        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
          <span className="text-yellow-600 text-xl">🔬</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skin Cancer Detection</h1>
          <p className="text-slate-500 text-sm">Upload dermoscopy image — AI detects benign or malignant</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">Upload Skin Lesion Image</h2>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Test Samples:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button key={s.type} onClick={() => loadSample(s.type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeSample === s.type
                      ? "border-yellow-500 bg-yellow-100 text-yellow-800"
                      : "border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-yellow-700"
                  }`}>
                  🧪 {s.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              onFileSelect={handleFileSelect}
              label="Dermoscopy / Skin Lesion Image"
              externalPreview={previewUrl}
              externalFileName={image?.name || ""}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Analyzing..." : "Detect Skin Cancer"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="bg-yellow-50 border border-yellow-100">
            <h3 className="font-semibold text-slate-800 mb-3">Detection Classes</h3>
            <div className="space-y-2">
              {[
                { label: "Benign",    desc: "Non-cancerous skin lesion",  color: "green" },
                { label: "Malignant", desc: "Melanoma — cancerous lesion", color: "red" },
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
            <div className="mt-3 p-3 bg-white rounded-xl border border-yellow-100">
              <p className="text-xs text-slate-500 font-medium">Model</p>
              <p className="text-sm text-slate-700 mt-0.5">MobileNetV2 — Dermoscopy Classification</p>
            </div>
          </Card>
          <ResultCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default SkinCancerDetection;
