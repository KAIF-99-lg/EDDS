import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiFileText, FiClock, FiArrowRight, FiHeart } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useAuth } from "../../hooks/useAuth";
import Card, { StatCard } from "../../components/Card";
import { predictionService } from "../../services/predictionService";
import { patientService } from "../../services/patientService";
import { formatDate } from "../../utils/helpers";

const tools = [
  { to: "/brain-tumor",   icon: GiBrain,      label: "Brain Tumor",    desc: "MRI scan analysis",         color: "purple" },
  { to: "/breast-cancer", icon: FiActivity,   label: "Breast Cancer",  desc: "Ultrasound analysis",       color: "pink" },
  { to: "/pneumonia",     icon: FiActivity,   label: "Pneumonia",      desc: "Chest X-ray analysis",      color: "blue" },
  { to: "/skin-cancer",   icon: FiActivity,   label: "Skin Cancer",    desc: "Dermoscopy analysis",       color: "yellow" },
  { to: "/heart",         icon: FiHeart,      label: "Heart Disease",  desc: "Cardiovascular risk",       color: "red" },
];

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));

const UserDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      predictionService.getMyHistory().catch(() => []),
      patientService.getMyReports().catch(() => []),
    ]).then(([h, r]) => {
      setHistory(h || []);
      setReports(r || []);
    }).finally(() => setLoading(false));
  }, []);

  const pending = reports.filter(r => r.status !== "Reviewed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name} 👋</h1>
        <p className="text-slate-500 mt-0.5">Your health dashboard</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<FiActivity size={22} />} label="Total Scans" value={loading ? "—" : history.length} color="blue"  loading={loading} />
        <StatCard icon={<FiFileText size={22} />} label="Reports"     value={loading ? "—" : reports.length} color="green" loading={loading} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">AI Detection Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tools.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card hover className="group text-center">
                <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${color}-600`} size={22} />
                </div>
                <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
                <p className="text-slate-500 text-xs mb-2">{desc}</p>
                <div className="flex items-center justify-center gap-1 text-blue-600 text-xs font-medium">
                  <span>Detect</span><FiArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Recent Activity</h2>
            <Link to="/history" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}</div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No predictions yet — start a detection above!</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isGood(h.result) ? "bg-green-100" : "bg-red-100"}`}>
                    <FiActivity className={isGood(h.result) ? "text-green-600" : "text-red-600"} size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{h.disease_type}</p>
                    <p className="text-xs text-slate-500">{formatDate(h.created_at)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isGood(h.result) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {h.result}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Recent Reports</h2>
            <Link to="/reports" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}</div>
          ) : reports.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No reports yet</p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <FiFileText className="text-blue-500 flex-shrink-0" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{r.report_type}</p>
                    <p className="text-xs text-slate-500">{formatDate(r.created_at)}</p>
                  </div>
                  <span className={r.status === "Reviewed" ? "badge-green" : "badge-yellow"}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
