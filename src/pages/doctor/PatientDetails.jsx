import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiActivity } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { getRiskBadge, formatDate } from "../../utils/helpers";
import LoadingSpinner from "../../components/LoadingSpinner";

const reportColumns = [
  { key: "id",          label: "Report ID",  render: (v) => v?.slice(0,8) },
  { key: "report_type", label: "Type" },
  { key: "created_at",  label: "Date",       render: (v) => formatDate(v) },
  { key: "result",      label: "Result",     render: (v) => <span className={`font-semibold ${v && (["Negative","Low Risk","Benign","Normal","No Tumor"].some(x=>v.includes(x))) ? "text-green-600" : "text-red-600"}`}>{v}</span> },
  { key: "status",      label: "Status",     render: (v) => <span className={v === "Reviewed" ? "badge-green" : "badge-yellow"}>{v}</span> },
];

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([patientService.getPatientById(id), patientService.getPatientReports(id)]).then(([p, r]) => {
      setPatient(p);
      setReports(r);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading patient details..." />;
  if (!patient) return <div className="card text-center py-12 text-slate-500">Patient not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/doctor/patients" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-slate-500 text-sm">Patient ID: {patient.id}</p>
        </div>
        <span className={`ml-auto ${getRiskBadge(patient.riskLevel)} text-sm px-3 py-1`}>{patient.riskLevel} Risk</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
              <FiUser className="text-blue-600" size={28} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">{patient.name}</h2>
            <p className="text-slate-500 text-sm">{patient.age} yrs · {patient.gender}</p>
          </div>
          <div className="space-y-3">
            {[
              { icon: FiPhone, label: patient.phone },
              { icon: FiMail, label: patient.email },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                <Icon size={15} className="text-slate-400" />{label}
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {[
                { label: "Blood Group", value: patient.blood_group || "—" },
                { label: "Gender",      value: patient.gender      || "—" },
                { label: "Status",      value: patient.status      || "—" },
                { label: "Risk Level",  value: patient.risk_level  || "—" },
              ].map((i) => (
                <div key={i.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{i.label}</span>
                  <span className="font-semibold text-slate-800">{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <h3 className="font-bold text-slate-800 mb-3">Medical Conditions</h3>
            {patient.conditions.length ? (
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((c) => <span key={c} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">{c}</span>)}
              </div>
            ) : <p className="text-slate-400 text-sm">No conditions recorded</p>}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><FiActivity size={16} />Reports</h3>
            </div>
            <Table columns={reportColumns} data={reports} emptyMessage="No reports found" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
