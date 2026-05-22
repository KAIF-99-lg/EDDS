import { useState, useEffect } from "react";
import { FiUser, FiSave } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { patientService } from "../../services/patientService";

const PatientProfile = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: "", age: "", gender: "", bloodGroup: "", address: "",
    emergencyContact: "", allergies: "", conditions: "",
  });

  useEffect(() => {
    patientService.getMyProfile()
      .then((p) => {
        if (p) {
          setProfileId(p.id);
          setForm({
            name:             p.name             || user?.name  || "",
            email:            p.email            || user?.email || "",
            phone:            p.phone            || "",
            age:              p.age              || "",
            gender:           p.gender           || "",
            bloodGroup:       p.blood_group      || "",
            address:          p.address          || "",
            emergencyContact: p.emergency_contact|| "",
            allergies:        p.allergies        || "",
            conditions:       Array.isArray(p.conditions) ? p.conditions.join(", ") : p.conditions || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await patientService.updateMyProfile({
        name:              form.name,
        phone:             form.phone,
        age:               form.age,
        gender:            form.gender,
        blood_group:       form.bloodGroup,
        address:           form.address,
        emergency_contact: form.emergencyContact,
        allergies:         form.allergies,
        conditions:        form.conditions,
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="card text-center py-12 text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FiUser className="text-blue-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Profile</h1>
          <p className="text-slate-500 text-sm">Manage your personal information</p>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError("")} />}

      <div className="flex items-center gap-4 card">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <FiUser className="text-blue-600" size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{form.name}</h2>
          <p className="text-slate-500">{form.email}</p>
          <span className="badge-blue mt-1">Patient ID: {profileId?.slice(0,8) || "—"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h3 className="font-bold text-slate-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "name",       label: "Full Name",    disabled: true },
              { name: "email",      label: "Email",        disabled: true, type: "email" },
              { name: "phone",      label: "Phone" },
              { name: "age",        label: "Age",          type: "number" },
              { name: "bloodGroup", label: "Blood Group" },
              { name: "address",    label: "Address" },
            ].map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input name={f.name} type={f.type || "text"} value={form[f.name]}
                  onChange={handleChange} className={`input ${f.disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}`}
                  disabled={f.disabled} />
              </div>
            ))}
            <div>
              <label className="label">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-800 mb-4">Medical Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Emergency Contact</label><input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="input" /></div>
            <div><label className="label">Known Allergies</label><input name="allergies" value={form.allergies} onChange={handleChange} className="input" /></div>
            <div className="col-span-2"><label className="label">Existing Conditions</label><textarea name="conditions" value={form.conditions} onChange={handleChange} className="input resize-none h-20" /></div>
          </div>
        </Card>

        <Button type="submit" loading={loading} size="lg" className="flex items-center gap-2">
          <FiSave size={16} /> Save Changes
        </Button>
      </form>
    </div>
  );
};

export default PatientProfile;
