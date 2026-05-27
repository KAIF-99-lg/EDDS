import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { patientService } from "../../services/patientService";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/Card";

const FIELDS = [
  { key: "name",              label: "Full Name",         type: "text" },
  { key: "email",             label: "Email",             type: "email",  readOnly: true },
  { key: "phone",             label: "Phone",             type: "text" },
  { key: "age",               label: "Age",               type: "number" },
  { key: "gender",            label: "Gender",            type: "select", options: ["Male", "Female", "Other"] },
  { key: "blood_group",       label: "Blood Group",       type: "select", options: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
  { key: "address",           label: "Address",           type: "text" },
  { key: "emergency_contact", label: "Emergency Contact", type: "text" },
  { key: "allergies",         label: "Allergies",         type: "text" },
];

const PatientProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    patientService.getMyProfile()
      .then((data) => { setProfile(data); setForm(data); })
      .catch(() => { if (user) { setProfile(user); setForm(user); } })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const updated = await patientService.updateMyProfile(form);
      setProfile(updated);
      setForm(updated);
      setEditing(false);
      setSuccess("Profile updated successfully.");
      localStorage.setItem("user", JSON.stringify(updated));
    } catch (e) {
      setError(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FiUser className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500 text-sm">Manage your personal information</p>
          </div>
        </div>
        {!editing ? (
          <button onClick={() => { setEditing(true); setSuccess(""); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <FiEdit2 size={15} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(profile); setError(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              <FiX size={15} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
              <FiSave size={15} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {error   && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm">{success}</div>}

      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, type, readOnly, options }) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</label>
              {!editing || readOnly ? (
                <p className="text-sm font-medium text-slate-800 py-2 px-3 bg-slate-50 rounded-xl">
                  {profile?.[key] || "—"}
                </p>
              ) : type === "select" ? (
                <select value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select…</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={type} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PatientProfile;
