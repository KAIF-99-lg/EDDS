import { useState, useEffect } from "react";
import { FiAlertCircle, FiCheck, FiClock } from "react-icons/fi";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { patientService } from "../../services/patientService";
import LoadingSpinner from "../../components/LoadingSpinner";

const severityConfig = {
  Critical: { badge: "badge-red", bg: "bg-red-50 border-red-200", icon: "text-red-500" },
  High:     { badge: "badge-red", bg: "bg-orange-50 border-orange-200", icon: "text-orange-500" },
  Medium:   { badge: "badge-yellow", bg: "bg-yellow-50 border-yellow-200", icon: "text-yellow-500" },
  Low:      { badge: "badge-blue", bg: "bg-blue-50 border-blue-200", icon: "text-blue-500" },
};

const Alerts = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [resolved, setResolved] = useState([]);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    patientService.getAllPatients()
      .then((data) => {
        // Show high/critical risk patients as alerts
        const highRisk = (data || []).filter((p) => ["High", "Critical"].includes(p.risk_level));
        setPatients(highRisk);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const alerts = patients.map((p) => ({
    id:       p.id,
    patient:  p.name,
    type:     p.risk_level === "Critical" ? "Critical Risk Patient" : "High Risk Patient",
    message:  `Patient has ${p.risk_level.toLowerCase()} risk level. Conditions: ${Array.isArray(p.conditions) ? p.conditions.join(", ") || "None" : p.conditions || "None"}`,
    severity: p.risk_level,
  }));

  const filtered = filter === "all" ? alerts
    : filter === "unresolved" ? alerts.filter((a) => !resolved.includes(a.id))
    : alerts.filter((a) => a.severity === filter);

  if (loading) return <LoadingSpinner text="Loading alerts..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <FiAlertCircle className="text-red-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="text-slate-500 text-sm">{alerts.filter((a) => !resolved.includes(a.id)).length} unresolved alerts</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "unresolved", "Critical", "High"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">No alerts found</Card>
        ) : (
          filtered.map((alert) => {
            const cfg = severityConfig[alert.severity] || severityConfig.Low;
            const isResolved = resolved.includes(alert.id);
            return (
              <div key={alert.id} className={`card border ${cfg.bg} ${isResolved ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-4">
                  <FiAlertCircle className={`${cfg.icon} mt-0.5 flex-shrink-0`} size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-800">{alert.patient}</span>
                      <span className={cfg.badge}>{alert.type}</span>
                      {isResolved && <span className="badge-green">Resolved</span>}
                    </div>
                    <p className="text-sm text-slate-600">{alert.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <FiClock size={12} /> Just now
                    </div>
                  </div>
                  {!isResolved && (
                    <Button variant="ghost" onClick={() => setResolved((p) => [...p, alert.id])}
                      className="flex items-center gap-1 text-green-600 hover:bg-green-50 !px-3 !py-1.5 text-sm">
                      <FiCheck size={14} /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Alerts;
