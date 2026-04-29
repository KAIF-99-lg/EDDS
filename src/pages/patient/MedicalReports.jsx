import { useState, useEffect } from "react";
import { FiFileText, FiEye, FiActivity, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiDownload } from "react-icons/fi";
import { generateReportPDF } from "../../utils/generateReportPDF";
import { patientService } from "../../services/patientService";
import { UPLOADS_URL } from "../../services/api";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import { formatDate, formatDateTime } from "../../utils/helpers";

const isGood = (v) => v && ["Negative","Low Risk","Benign","Normal","No Tumor"].some(x => v.includes(x));
const statusColor = (v) => v === "Reviewed" ? "badge-green" : "badge-yellow";

const ReportModal = ({ report, onClose }) => {
  if (!report) return null;
  const good = isGood(report.result);
  const Icon = good ? FiCheckCircle : report.result ? FiAlertCircle : FiAlertTriangle;
  const colors = good
    ? { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500", badge: "bg-green-100 text-green-800", bar: "bg-green-500" }
    : { bg: "bg-red-50",   border: "border-red-200",   icon: "text-red-500",   badge: "bg-red-100 text-red-800",   bar: "bg-red-500" };

  return (
    <Modal isOpen={!!report} onClose={onClose} title="Report Details" size="md">
      <div className="space-y-4">
        {/* Image */}
        {report.image_path && (
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <img src={`${UPLOADS_URL}/${report.image_path}`} alt="Scan" className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center gap-4 p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Icon className={colors.icon} size={28} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Test Type</p>
            <p className="text-lg font-bold text-slate-800">{report.report_type}</p>
            <span className={`px-3 py-0.5 rounded-full text-sm font-semibold ${colors.badge}`}>{report.result}</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">Date</p>
            <p className="font-semibold text-slate-800 text-sm">{formatDateTime(report.created_at)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">Status</p>
            <span className={statusColor(report.status)}>{report.status}</span>
          </div>
          {report.confidence != null && (
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500">Confidence Score</span>
                <span className="font-bold text-slate-800">{report.confidence}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${report.confidence}%` }} />
              </div>
            </div>
          )}
          {report.risk_score != null && (
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-500">Risk Score</span>
                <span className="font-bold text-slate-800">{report.risk_score}/100</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${report.risk_score}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Recommendation */}
        {report.recommendation && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-2">
              <FiActivity className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Medical Recommendation</p>
                <p className="text-sm text-slate-600">{report.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Doctor notes */}
        {report.doctor_notes && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm font-semibold text-slate-700 mb-1">Doctor's Notes</p>
            <p className="text-sm text-slate-600">{report.doctor_notes}</p>
          </div>
        )}

        {/* Doctor / Hospital info */}
        {(report.doctor_name || report.hospital) && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm text-slate-600">
            {report.doctor_name && <p><span className="font-semibold">Doctor:</span> Dr. {report.doctor_name} {report.specialization ? `(${report.specialization})` : ""}</p>}
            {report.hospital && <p><span className="font-semibold">Hospital:</span> {report.hospital}</p>}
          </div>
        )}

        <button
          onClick={async () => {
            try {
              await generateReportPDF(report);
            } catch (err) {
              console.error("PDF generation failed:", err);
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
          <FiDownload size={16} /> Download PDF Report
        </button>
      </div>
    </Modal>
  );
};

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts]   = useState({ total: 0, reviewed: 0, pending: 0 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    patientService.getMyReports()
      .then((data) => {
        setReports(data);
        setCounts({
          total:    data.length,
          reviewed: data.filter(r => r.status === "Reviewed").length,
          pending:  data.filter(r => r.status !== "Reviewed").length,
        });
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "id",          label: "Report ID",  render: (v) => v?.slice(0, 8) },
    { key: "report_type", label: "Test Type" },
    { key: "created_at",  label: "Date",       render: (v) => formatDate(v) },
    { key: "result",      label: "Result",     render: (v) => <span className={`font-semibold ${isGood(v) ? "text-green-600" : "text-red-600"}`}>{v}</span> },
    { key: "status",      label: "Status",     render: (v) => <span className={statusColor(v)}>{v}</span> },
    {
      key: "actions", label: "Actions", render: (_, row) => (
        <div className="flex gap-1">
          <button onClick={() => setSelected(row)}
            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
            <FiEye size={15} />
          </button>
          <button onClick={async () => {
            try {
              await generateReportPDF(row);
            } catch (err) {
              console.error("PDF generation failed:", err);
            }
          }}
            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Download PDF">
            <FiDownload size={15} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Reports</h1>
        <p className="text-slate-500 text-sm">All your AI analysis reports</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reports", value: counts.total,    color: "blue" },
          { label: "Reviewed",      value: counts.reviewed, color: "green" },
          { label: "Pending",       value: counts.pending,  color: "yellow" },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FiFileText size={18} />All Reports
        </h2>
        <Table columns={columns} data={reports} loading={loading}
          searchable searchKeys={["report_type", "result"]} emptyMessage="No reports found" />
      </Card>

      <ReportModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default MedicalReports;
