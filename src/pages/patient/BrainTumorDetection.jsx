import { useState } from "react";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ImageUpload from "../../components/ImageUpload";
import ResultCard from "../../components/ResultCard";
import Alert from "../../components/Alert";

const toDisplayResult = (data) => ({
  ...data,
  disease: "Brain Tumor",
  confidence: data.confidence,
  timestamp: data.timestamp || data.created_at,
});

const generateSampleImage = (type) =>
  new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 224; canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, 224, 224);
    const g = ctx.createRadialGradient(112, 112, 10, 112, 112, 100);
    g.addColorStop(0, "#fff"); g.addColorStop(0.4, "#888"); g.addColorStop(1, "#111");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 224, 224);
    canvas.toBlob((blob) =>
      resolve(new File([blob], `sample_${type}.png`, { type: "image/png" }))
    );
  });

const samples = [
  { type: "glioma",     label: "Glioma" },
  { type: "meningioma", label: "Meningioma" },
  { type: "notumor",    label: "No Tumor" },
  { type: "pituitary",  label: "Pituitary" },
];

const BrainTumorDetection = () => {
  const [image, setImage]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [activeSample, setActiveSample] = useState(null);

  const loadSampleImage = async (type) => {
    const file = await generateSampleImage(type);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setActiveSample(type);
    setResult(null);
    setError("");
  };

  const handleFileSelect = (file) => {
    setImage(file);
    setActiveSample(null);
    if (!file) setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please upload an MRI scan image."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await predictionService.predictBrainTumor(image);
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
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <span className="text-purple-600 text-xl">🧠</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brain Tumor Detection</h1>
          <p className="text-slate-500 text-sm">Upload MRI scan — AI detects tumor type</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold text-slate-800 mb-3">Upload MRI Scan</h2>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Test Samples:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button key={s.type} type="button" onClick={() => loadSampleImage(s.type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeSample === s.type
                      ? "border-purple-500 bg-purple-100 text-purple-800"
                      : "border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700"
                  }`}>
                  🧪 {s.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              onFileSelect={handleFileSelect}
              label="Brain MRI Scan (JPEG/PNG)"
              externalPreview={previewUrl}
              externalFileName={image?.name || ""}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Analyzing MRI..." : "Detect Brain Tumor"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="bg-purple-50 border border-purple-100">
            <h3 className="font-semibold text-slate-800 mb-3">Detection Classes</h3>
            <div className="space-y-2">
              {[
                { label: "Glioma",     desc: "Malignant brain/spine tumor",  color: "red" },
                { label: "Meningioma", desc: "Tumor in brain membranes",      color: "orange" },
                { label: "No Tumor",   desc: "No abnormality detected",       color: "green" },
                { label: "Pituitary",  desc: "Tumor in pituitary gland",      color: "yellow" },
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
            <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100">
              <p className="text-xs text-slate-500 font-medium">Model</p>
              <p className="text-sm text-slate-700 mt-0.5">MobileNetV2 — MRI Classification</p>
            </div>
          </Card>
          <ResultCard result={result} loading={loading} imageUrl={previewUrl} />
        </div>
      </div>
    </div>
  );
};

export default BrainTumorDetection;
