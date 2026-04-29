import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiAlertCircle, FiActivity, FiFileText, FiHeart } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useAuth } from "../../hooks/useAuth";
import Card, { StatCard } from "../../components/Card";
import Button from "../../components/Button";
import { patientService } from "../../services/patientService";
import { apiRequest } from "../../services/api";
import { getRiskBadge } from "../../utils/helpers";

const detectionTools = [
  { to: "/doctor/pneumonia", label: "Pneumonia", icon: FiActivity, color: "blue" },
  { to: "/doctor/heart", label: "Heart Disease", icon: FiHeart, color: "red" },
  { to: "/doctor/brain-tumor", label: "Brain Tumor", icon: GiBrain, color: "purple" },
  { to: "/doctor/skin-cancer", label: "Skin Cancer", icon: FiActivity, color: "yellow" },
  { to: "/doctor/breast-cancer", label: "Breast Cancer", icon: FiActivity, color: "green" },
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingReports, setPendingReports] = useState(0);
  const [scansToday, setScansToday] = useState(0);

  useEffect(() => {
    patientService.getAllPatients()
      .then((data) => { setPatients(data || []); setLoading(false); })
      .catch(() => { setError("Failed to load patients"); setLoading(false); });
    apiRequest("/reports")
      .then((data) => {
        const reports = data || [];
        setPendingReports(reports.filter(r => r.status !== "Reviewed").length);
        const today = new Date().toDateString();
        setScansToday(reports.filter(r => new Date(r.created_at).toDateString() === today).length);
      })
      .catch(() => {});
  }, []);

  const highRisk = patients.filter((p) => p.risk_level === "High" || p.risk_level === "Critical");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500 mt-0.5">Welcome, {user?.name} · {user?.specialization}</p>
        </div>
        <Link to="/doctor/patients">
          <Button>View All Patients</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiUsers size={22} />} label="Total Patients" value={loading ? "—" : patients.length} color="blue" loading={loading} />
        <StatCard icon={<FiAlertCircle size={22} />} label="High Risk" value={loading ? "—" : highRisk.length} color="red" loading={loading} />
        <StatCard icon={<FiActivity size={22} />} label="Scans Today" value={scansToday} color="green" />
        <StatCard icon={<FiFileText size={22} />} label="Pending Reviews" value={pendingReports} color="yellow" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">AI Detection Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {detectionTools.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <Card hover className="text-center group py-4">
                <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${color}-600`} size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FiAlertCircle className="text-red-500" size={18} /> High Risk Patients
            </h2>
            <Link to="/doctor/alerts" className="text-blue-600 text-sm font-medium hover:underline">View alerts</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}</div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : highRisk.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No high risk patients</p>
          ) : (
            <div className="space-y-3">
              {highRisk.slice(0, 4).map((p) => (
                <Link key={p.id} to={`/doctor/patient/${p.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                    <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUsers className="text-red-600" size={15} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {Array.isArray(p.conditions) ? p.conditions.join(", ") : p.conditions || "No conditions"}
                      </p>
                    </div>
                    <span className={getRiskBadge(p.risk_level)}>{p.risk_level}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold text-slate-800 mb-4">Patient Risk Distribution</h2>
          <div className="space-y-3">
            {[
              { label: "Critical", count: patients.filter((p) => p.risk_level === "Critical").length, color: "red" },
              { label: "High Risk", count: patients.filter((p) => p.risk_level === "High").length, color: "orange" },
              { label: "Medium Risk", count: patients.filter((p) => p.risk_level === "Medium").length, color: "yellow" },
              { label: "Low Risk", count: patients.filter((p) => p.risk_level === "Low").length, color: "green" },
            ].map((r) => {
              const pct = patients.length ? Math.round((r.count / patients.length) * 100) : 0;
              return (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{r.label}</span>
                    <span className="font-bold text-slate-800">{loading ? "—" : r.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${r.color}-500 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
