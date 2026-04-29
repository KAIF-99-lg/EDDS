import { useState, useEffect } from "react";
import { FiFileText, FiEye, FiCheck, FiActivity, FiAlertCircle, FiCheckCircle, FiDownload } from "react-icons/fi";
import { generateReportPDF } from "../../utils/generateReportPDF";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import { apiRequest, UPLOADS_URL } from "../../services/api";
import { formatDate, formatDateTime } from "../../utils/helpers";

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));

const ReportReview = () => {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState("all"); // all | pending | reviewed

  useEffect(() => {
    apiRequest("/reports")
      .then((data) => setReports(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReview = (report) => { setSelected(report); setNotes(report.doctor_notes || ""); };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const updated = await apiRequest(`/reports/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({ doctor_notes: notes, status: "Reviewed" }),
      });
      setReports((prev) => prev.map((r) => r.id === selected.id ? { ...r, ...updated } : r));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "all" ? reports
    : filter === "pending"  ? reports.filter(r => r.status !== "Reviewed")
    : reports.filter(r => r.status === "Reviewed");

  const pending = reports.filter(r => r.status !== "Reviewed").length;

  const columns = [
    { key: "id",          label: "Report ID",  render: (v) => <span className="text-xs font-mono text-slate-500">{v?.slice(0,8)}...</span> },
    { key: "patient_id",  label: "Patient",    render: (v) => <span className="text-xs font-mono text-slate-500">{v?.slice(0,8)}...</span> },
    { key: "report_type", label: "Test Type" },
    { key: "created_at",  label: "Date",       render: (v) => formatDate(v) },
    { key: "result",      label: "Result",     render: (v) => <span className={`font-semibold ${isGood(v) ? "text-green-600" : "text-red-600"}`}>{v || "—"}</span> },
    { key: "status",      label: "Status",     render: (v) => <span className={v === "Reviewed" ? "badge-green" : "badge-yellow"}>{v}</span> },
    { key: "id",          label: "Action",     render: (_, row) => (
      <button onClick={() => handleReview(row)} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
        <FiEye size={14} /> {row.status === "Reviewed" ? "View" : "Review"}
      </button>
    )},
  ];

  if (loading) return <LoadingSpinner text="Loading reports..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiFileText className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Review</h1>
          <p className="text-slate-500 text-sm">{pending} pending review{pending !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: reports.length,                                  color: "blue" },
          { label: "Pending",  value: pending,                                         color: "yellow" },
          { label: "Reviewed", value: reports.filter(r => r.status === "Reviewed").length, color: "green" },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-slate-500 text-sm">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all","pending","reviewed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No reports found</p>
        ) : (
          <Table columns={columns} data={filtered} searchable searchKeys={["report_type","result","status"]} emptyMessage="No reports found" />
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Report Review"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="secondary" onClick={async () => { try { await generateReportPDF(selected); } catch(e) { console.error(e); } }} className="flex items-center gap-2">
              <FiDownload size={14} /> Download PDF
            </Button>
            {selected?.status !== "Reviewed" && (
              <Button loading={saving} onClick={handleApprove} className="flex items-center gap-2">
                <FiCheck size={14} /> Mark as Reviewed
              </Button>
            )}
          </>
        }
      >
        {selected && (() => {
          const good = isGood(selected.result);
          const Icon = good ? FiCheckCircle : FiAlertCircle;
          const colors = good
            ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500", badge: "bg-green-100 text-green-800", bar: "bg-green-500" }
            : { bg: "bg-red-50",   border: "border-red-200",   icon: "text-red-500",   badge: "bg-red-100 text-red-800",   bar: "bg-red-500" };
          return (
            <div className="space-y-4">
              {/* Image */}
              {selected.image_path && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img src={`${UPLOADS_URL}/${selected.image_path}`} alt="Scan" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Result header */}
              <div className={`flex items-center gap-4 p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Icon className={colors.icon} size={26} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Test Type</p>
                  <p className="text-lg font-bold text-slate-800">{selected.report_type}</p>
                  <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${colors.badge}`}>{selected.result}</span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-semibold text-slate-800 text-sm">{formatDateTime(selected.created_at)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={selected.status === "Reviewed" ? "badge-green" : "badge-yellow"}>{selected.status}</span>
                </div>

                {selected.confidence != null && (
                  <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-bold text-slate-800">{selected.confidence}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${selected.confidence}%` }} />
                    </div>
                  </div>
                )}
                {selected.risk_score != null && (
                  <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Risk Score</span>
                      <span className="font-bold text-slate-800">{selected.risk_score}/100</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${selected.risk_score}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendation */}
              {selected.recommendation && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <FiActivity className="text-blue-500 mt-0.5 flex-shrink-0" size={15} />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">AI Recommendation</p>
                      <p className="text-sm text-slate-600">{selected.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor notes */}
              <div>
                <label className="label">Doctor Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add clinical notes, diagnosis, follow-up instructions..."
                  className="input resize-none h-28"
                  readOnly={selected.status === "Reviewed"}
                />
              </div>

              {selected.status === "Reviewed" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                  <FiCheck className="text-green-500" size={16} />
                  <p className="text-sm text-green-700 font-medium">This report has been reviewed</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ReportReview;
