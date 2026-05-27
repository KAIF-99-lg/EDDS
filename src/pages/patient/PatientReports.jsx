import { useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { formatDate } from "../../utils/helpers";

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));

const columns = [
  { key: "id",           label: "#",           render: (v) => v?.slice(0, 8) },
  { key: "disease_type", label: "Disease" },
  { key: "result",       label: "Result",      render: (v) => (
    <span className={`font-semibold ${isGood(v) ? "text-green-600" : "text-red-600"}`}>{v}</span>
  )},
  { key: "confidence",   label: "Confidence",  render: (v) => v ? `${v}%` : "—" },
  { key: "recommendation", label: "Recommendation", render: (v) => <span className="text-xs text-slate-500">{v || "—"}</span> },
  { key: "created_at",   label: "Date",        render: (v) => formatDate(v) },
];

const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService.getMyReports()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <FiFileText className="text-green-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
          <p className="text-slate-500 text-sm">All your AI-generated medical reports</p>
        </div>
      </div>
      <Card>
        <Table
          columns={columns}
          data={reports}
          loading={loading}
          searchable
          searchKeys={["disease_type", "result"]}
          emptyMessage="No reports found"
        />
      </Card>
    </div>
  );
};

export default PatientReports;
