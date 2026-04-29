import { useState, useEffect } from "react";
import { FiActivity, FiAlertCircle } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import Card from "../../components/Card";
import Table from "../../components/Table";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getRiskBadge } from "../../utils/helpers";

const columns = [
  { key: "name", label: "Patient", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
  { key: "age", label: "Age", render: (v) => v || "—" },
  { key: "conditions", label: "Conditions", render: (v) => Array.isArray(v) ? v.join(", ") || "—" : v || "—" },
  { key: "risk_level", label: "Risk", render: (v) => <span className={getRiskBadge(v)}>{v}</span> },
  { key: "status", label: "Status", render: (v) => <span className={v === "Critical" ? "badge-red" : "badge-yellow"}>{v}</span> },
];

const PatientMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    patientService.getAllPatients()
      .then((data) => {
        setPatients((data || []).filter((p) => ["High", "Critical"].includes(p.risk_level)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading patients..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiActivity className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Monitoring</h1>
          <p className="text-slate-500 text-sm">{patients.length} high-risk patients being monitored</p>
        </div>
      </div>

      {/* Dynamic patient cards from real data */}
      {patients.length > 0 && (
        <div>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> High Risk Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {patients.slice(0, 3).map((p) => (
              <Card key={p.id} className={p.risk_level === "Critical" ? "border-red-200 bg-red-50/50" : "border-orange-200 bg-orange-50/50"}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-800">{p.name}</p>
                  <FiAlertCircle className={p.risk_level === "Critical" ? "text-red-500" : "text-orange-500"} size={18} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Risk", value: p.risk_level, alert: p.risk_level === "Critical" },
                    { label: "Age", value: p.age ? `${p.age} yrs` : "—", alert: false },
                    { label: "Status", value: p.status || "—", alert: p.status === "Critical" },
                    { label: "Blood", value: p.blood_group || "—", alert: false },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">{m.label}</p>
                      <p className={`font-bold text-sm ${m.alert ? "text-red-600" : "text-slate-800"}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
                {Array.isArray(p.conditions) && p.conditions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.conditions.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-white rounded-full text-xs text-slate-600 border border-slate-200">{c}</span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <h2 className="font-bold text-slate-800 mb-4">All High Risk Patients</h2>
        <Table
          columns={columns}
          data={patients}
          searchable
          searchKeys={["name", "status"]}
          emptyMessage="No high-risk patients — all patients are safe ✅"
        />
      </Card>
    </div>
  );
};

export default PatientMonitoring;
