import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";
import { predictionService } from "../../services/predictionService";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { formatDate } from "../../utils/helpers";

const columns = [
  { key: "id",          label: "#", render: (v) => v?.slice(0,8) },
  { key: "disease_type", label: "Disease" },
  { key: "result",      label: "Result", render: (v) => <span className={`font-semibold ${["Negative","Low Risk","Benign","Normal","No Tumor"].includes(v) ? "text-green-600" : "text-red-600"}`}>{v}</span> },
  { key: "confidence",  label: "Confidence", render: (v) => v ? `${v}%` : "—" },
  { key: "risk_score",  label: "Risk Score",  render: (v) => v ? `${v}/100` : "—" },
  { key: "created_at",  label: "Date",        render: (v) => formatDate(v) },
];

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionService.getMyHistory()
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiClock className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prediction History</h1>
          <p className="text-slate-500 text-sm">All your past AI predictions</p>
        </div>
      </div>
      <Card>
        <Table columns={columns} data={history} loading={loading} searchable searchKeys={["disease", "result"]} emptyMessage="No prediction history found" />
      </Card>
    </div>
  );
};

export default PredictionHistory;
