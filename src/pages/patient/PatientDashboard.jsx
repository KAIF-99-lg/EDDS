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
  { to: "/patient/pneumonia",    icon: FiActivity, label: "Pneumonia Detection", desc: "Chest X-ray analysis",         color: "blue" },
  { to: "/patient/heart",        icon: FiHeart,    label: "Heart Disease",        desc: "Cardiovascular risk",          color: "red" },
  { to: "/patient/brain-tumor",  icon: GiBrain,    label: "Brain Tumor",          desc: "MRI scan analysis",            color: "purple" },
  { to: "/patient/skin-cancer",  icon: FiActivity, label: "Skin Cancer",          desc: "Dermoscopy image analysis",    color: "yellow" },
  { to: "/patient/breast-cancer",icon: FiActivity, label: "Breast Cancer",        desc: "Ultrasound image analysis",    color: "green" },
];

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));

const PatientDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [reports, setReports]   = useState([]);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      predictionService.getMyHistory().catch(() => []),
      patientService.getMyReports().catch(() => []),
      patientService.getMyProfile().catch(() => null),
    ]).then(([h, r, p]) => {
      setHistory(h || []);
      setReports(r || []);
      setProfile(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="text-slate-500 mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-slate-500">Patient ID</p>
          <p className="font-bold text-blue-600">{profile?.id?.slice(0,8) || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<FiActivity size={22} />} label="Total Scans" value={loading ? "—" : history.length} color="blue"  loading={loading} />
        <StatCard icon={<FiFileText size={22} />} label="Reports"     value={loading ? "—" : reports.length} color="green" loading={loading} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">AI Detection Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card hover className="group">
                <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${color}-600`} size={22} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{label}</h3>
                <p className="text-slate-500 text-sm mb-3">{desc}</p>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                  <span>Start Analysis</span>
                  <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
            <Link to="/patient/history" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}</div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No predictions yet</p>
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
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isGood(h.result) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{h.result}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-800 mb-4">Health Summary</h2>
          <div className="space-y-3">
            {[
              { label: "Blood Group",  value: profile?.blood_group || "—" },
              { label: "Age",          value: profile?.age ? `${profile.age} years` : "—" },
              { label: "Gender",       value: profile?.gender || "—" },
              { label: "Status",       value: profile?.status || "Active" },
              { label: "Risk Level",   value: profile?.risk_level || "Low" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
