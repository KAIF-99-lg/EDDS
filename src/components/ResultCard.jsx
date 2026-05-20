import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiActivity, FiDownload } from "react-icons/fi";
import Card from "./Card";
import { formatDateTime } from "../utils/helpers";
import { generateReportPDF } from "../utils/generateReportPDF";

const ResultCard = ({ result, loading, imageUrl }) => {
  if (loading) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-semibold text-lg">Analyzing...</p>
        <p className="text-slate-400 text-sm mt-1">AI model processing your data</p>
      </Card>
    );
  }

  if (!result) return null;

  const diseaseLabel = result.disease || result.disease_type || "Analysis";
  const timestampLabel = result.timestamp || result.created_at;
  const confidence = result.confidence;
  const riskScore = result.riskScore ?? result.risk_score;

  const isPositive = ["Positive", "High Risk", "Detected", "Melanoma Detected", "Malignant"].includes(result.result);
  const isNegative = ["Negative", "Low Risk", "Benign", "Normal"].includes(result.result);

  const Icon = isPositive ? FiAlertCircle : isNegative ? FiCheckCircle : FiAlertTriangle;
  const colors = isPositive
    ? { bg: "bg-red-50", border: "border-red-200", icon: "text-red-500", badge: "bg-red-100 text-red-800", bar: "bg-red-500" }
    : isNegative
    ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500", badge: "bg-green-100 text-green-800", bar: "bg-green-500" }
    : { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-500", badge: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-500" };

  return (
    <Card className={`${colors.bg} border ${colors.border} animate-slide-up`}>
      {imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
          <img src={imageUrl} alt="Analyzed scan" className="w-full h-44 object-cover" />
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-white shadow-sm`}>
          <Icon className={colors.icon} size={28} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-800">{diseaseLabel} Analysis</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>{result.result}</span>
          </div>
          {timestampLabel && <p className="text-slate-500 text-sm mt-1">{formatDateTime(timestampLabel)}</p>}
        </div>
      </div>

      {confidence != null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-600 font-medium">Confidence Score</span>
            <span className="font-bold text-slate-800">{confidence}%</span>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden">
            <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000`} style={{ width: `${confidence}%` }} />
          </div>
        </div>
      )}

      {riskScore != null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-600 font-medium">Risk Score</span>
            <span className="font-bold text-slate-800">{riskScore}/100</span>
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden">
            <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000`} style={{ width: `${riskScore}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {result.severity && <div className="bg-white rounded-xl p-3"><p className="text-xs text-slate-500">Severity</p><p className="font-semibold text-slate-800">{result.severity}</p></div>}
        {result.tumorType && <div className="bg-white rounded-xl p-3"><p className="text-xs text-slate-500">Tumor Type</p><p className="font-semibold text-slate-800">{result.tumorType}</p></div>}
        {result.size && <div className="bg-white rounded-xl p-3"><p className="text-xs text-slate-500">Size</p><p className="font-semibold text-slate-800">{result.size}</p></div>}
        {result.location && <div className="bg-white rounded-xl p-3"><p className="text-xs text-slate-500">Location</p><p className="font-semibold text-slate-800">{result.location}</p></div>}
        {result.stage && <div className="bg-white rounded-xl p-3"><p className="text-xs text-slate-500">Stage</p><p className="font-semibold text-slate-800">{result.stage}</p></div>}
        {result.classification && <div className="bg-white rounded-xl p-3 col-span-2"><p className="text-xs text-slate-500">Classification</p><p className="font-semibold text-slate-800">{result.classification}</p></div>}
      </div>

      {result.factors && (
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600 mb-2">Risk Factors</p>
          <div className="flex flex-wrap gap-2">
            {result.factors.map((f) => <span key={f} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 border border-slate-200">{f}</span>)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-start gap-2">
          <FiActivity className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Medical Recommendation</p>
            <p className="text-sm text-slate-600">{result.recommendation}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => generateReportPDF(result)}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <FiDownload size={16} />
        Download PDF Report
      </button>
    </Card>
  );
};

export default ResultCard;
