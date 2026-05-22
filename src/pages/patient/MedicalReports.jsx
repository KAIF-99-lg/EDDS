import { useState, useEffect } from "react";
import { FiFileText, FiActivity, FiCheckCircle, FiAlertCircle, FiUser } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import { useAuth } from "../../hooks/useAuth";
import { UPLOADS_URL } from "../../services/api";
import { formatDateTime } from "../../utils/helpers";

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));

const MedicalReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getMyReports()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);


  const ReportCard = ({ report }) => {
    const good   = isGood(report.result);
    const colors = good
      ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500", badge: "bg-green-100 text-green-700", bar: "bg-green-500" }
      : { bg: "bg-red-50",   border: "border-red-200",   icon: "text-red-500",   badge: "bg-red-100 text-red-700",   bar: "bg-red-500"   };
    const Icon = good ? FiCheckCircle : FiAlertCircle;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {report.image_path && (
          <img src={`${UPLOADS_URL}/${report.image_path}`} alt="Scan"
            className="w-full object-contain border-b border-slate-100 bg-black" />
        )}

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
            <FiUser size={12} />
            <span className="font-semibold text-slate-700">{user?.name || "—"}</span>
            {user?.age    && <span>· Age {user.age}</span>}
            {user?.gender && <span>· {user.gender}</span>}
            {user?.blood_group && <span>· {user.blood_group}</span>}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
            <Icon className={colors.icon} size={22} />
            <div className="flex-1">
              <p className="font-bold text-slate-800">{report.report_type}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{report.result}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === "Reviewed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {report.status}
            </span>
          </div>

          <p className="text-xs text-slate-400">{formatDateTime(report.created_at)}</p>

          {report.confidence != null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Confidence</span>
                <span className="font-bold text-slate-700">{report.confidence}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${report.confidence}%` }} />
              </div>
            </div>
          )}
          {report.risk_score != null && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Risk Score</span>
                <span className="font-bold text-slate-700">{report.risk_score}/100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${report.risk_score}%` }} />
              </div>
            </div>
          )}

          {report.recommendation && (
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
              <FiActivity className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
              <p className="text-xs text-slate-600">{report.recommendation}</p>
            </div>
          )}


        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiFileText className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Reports</h1>
          <p className="text-slate-500 text-sm">{reports.length} report{reports.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FiFileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No reports yet — run a detection to generate one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
