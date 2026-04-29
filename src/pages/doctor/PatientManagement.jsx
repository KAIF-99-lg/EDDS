import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiFilter, FiUserPlus } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { getRiskBadge } from "../../utils/helpers";

const emptyForm = { name: "", age: "", gender: "", bloodGroup: "", phone: "", email: "", riskLevel: "Low", conditions: "", status: "Active" };

const riskFilters = ["All", "Critical", "High", "Medium", "Low"];

const columns = [
  { key: "id", label: "ID", render: (v) => <span className="text-xs font-mono text-slate-500">{v?.slice(0, 8)}...</span> },
  { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "blood_group", label: "Blood" },
  { key: "conditions", label: "Conditions", render: (v) => Array.isArray(v) && v.length ? v.join(", ") : <span className="text-slate-400">None</span> },
  { key: "risk_level", label: "Risk", render: (v) => <span className={getRiskBadge(v)}>{v}</span> },
  { key: "status", label: "Status", render: (v) => <span className={v === "Active" ? "badge-green" : v === "Critical" ? "badge-red" : "badge-yellow"}>{v}</span> },
  { key: "action", label: "Action", render: (_, row) => <Link to={`/doctor/patient/${row.id}`} className="text-blue-600 text-sm font-medium hover:underline">View</Link> },
];

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.age) e.age = "Required";
    if (!form.gender) e.gender = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    return e;
  };

  const handleAdd = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const newPatient = await patientService.addPatient(form);
      setPatients((p) => [newPatient, ...p]);
      setShowModal(false);
      setForm(emptyForm);
      setSuccess(`Patient added! ID: ${newPatient.id}`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setErrors({ name: err.message || "Failed to add patient" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    patientService.getAllPatients().then((data) => { setPatients(data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = riskFilter === "All" ? patients : patients.filter((p) => p.risk_level === riskFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FiUsers className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
            <p className="text-slate-500 text-sm">{patients.length} total patients</p>
          </div>
        </div>
        <Button onClick={() => { setShowModal(true); setErrors({}); setForm(emptyForm); }} className="flex items-center gap-2">
          <FiUserPlus size={16} /> Add Patient
        </Button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      {/* Risk Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="text-slate-400" size={16} />
        {riskFilters.map((f) => (
          <button
            key={f}
            onClick={() => setRiskFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${riskFilter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          searchable
          searchKeys={["name", "id", "conditions"]}
          emptyMessage="No patients found"
        />
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Patient"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd} className="flex items-center gap-2"><FiUserPlus size={15} /> Add Patient</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "name", label: "Full Name", placeholder: "John Smith", span: 2 },
            { name: "age", label: "Age", type: "number", placeholder: "e.g. 34" },
            { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
            { name: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
            { name: "riskLevel", label: "Risk Level", type: "select", options: ["Low", "Medium", "High", "Critical"] },
            { name: "phone", label: "Phone", placeholder: "+1-555-0000" },
            { name: "email", label: "Email", type: "email", placeholder: "patient@email.com" },
            { name: "status", label: "Status", type: "select", options: ["Active", "Under Treatment", "Critical"] },
            { name: "conditions", label: "Conditions (comma separated)", placeholder: "e.g. Diabetes, Hypertension", span: 2 },
          ].map((f) => (
            <div key={f.name} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="label">{f.label}</label>
              {f.type === "select" ? (
                <select name={f.name} value={form[f.name]} onChange={handleChange} className={`input ${errors[f.name] ? "border-red-400" : ""}`}>
                  <option value="">Select</option>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input name={f.name} type={f.type || "text"} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} className={`input ${errors[f.name] ? "border-red-400" : ""}`} />
              )}
              {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default PatientManagement;
