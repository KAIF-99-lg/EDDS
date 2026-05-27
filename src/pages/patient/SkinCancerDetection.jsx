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

const samples = [
  { label: "Benign",    path: "/samples/skin/benign/image.png",    ext: "png" },
  { label: "Malignant", path: "/samples/skin/malignant/image.jpg", ext: "jpg" },
];

const SkinCancerDetection = () => {
  const [image, setImage]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [activeSample, setActiveSample] = useState(null);

  const loadSample = async ({ label, path, ext }) => {
    const res  = await fetch(path);
    const blob = await res.blob();
    const file = new File([blob], `sample_${label}.${ext}`, { type: blob.type });
    setImage(file);
    setPreviewUrl(path);
    setActiveSample(label);
    setResult(null); setError("");
  };

  const handleFileSelect = (file) => {
    setImage(file);
    setActiveSample(null);
    if (!file) setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError("Please upload a skin lesion image."); return; }
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

          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-2 font-medium">Quick Test Samples:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button key={s.label} type="button" onClick={() => loadSample(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeSample === s.label
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
          <ResultCard result={result} loading={loading} imageUrl={previewUrl} />
        </div>
      </div>
    </div>
  );
};

export default SkinCancerDetection;
