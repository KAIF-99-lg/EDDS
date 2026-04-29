import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiActivity, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone, FiMapPin, FiAward, FiHome } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Button from "../components/Button";
import Alert from "../components/Alert";

const SPECIALIZATIONS = [
  "Cardiologist", "Neurologist", "Oncologist", "Radiologist",
  "Dermatologist", "Pulmonologist", "General Physician", "Other",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const validate = (v) => {
  const e = {};
  if (!v.name)     e.name     = "Name is required";
  if (!v.email)    e.email    = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email";
  if (!v.password) e.password = "Password is required";
  else if (v.password.length < 8) e.password = "Min 8 characters";
  if (!v.gender)   e.gender   = "Select gender";
  if (v.role === "doctor"  && !v.specialization) e.specialization = "Select specialization";
  if (v.role === "doctor"  && !v.hospital)       e.hospital       = "Hospital name is required";
  if (v.role === "patient" && !v.age)            e.age            = "Age is required";
  return e;
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Signup = () => {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    {
      name: "", email: "", password: "", role: "patient", gender: "",
      age: "", phone: "", blood_group: "", address: "",
      specialization: "", hospital: "", license_number: "", doctor_phone: "",
    },
    validate
  );

  const isDoctor = values.role === "doctor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true); setError("");
    try {
      const payload = {
        name:     values.name,
        email:    values.email,
        password: values.password,
        role:     values.role,
        gender:   values.gender,
        ...(isDoctor ? {
          specialization: values.specialization,
          hospital:       values.hospital,
          license_number: values.license_number,
          phone:          values.doctor_phone,
        } : {
          age:         values.age,
          phone:       values.phone,
          blood_group: values.blood_group,
          address:     values.address,
        }),
      };
      await signup(payload);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Signup failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const Inp = ({ name, placeholder, icon, type = "text", extra = {} }) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        name={name} type={type} value={values[name]}
        onChange={handleChange} onBlur={handleBlur}
        placeholder={placeholder}
        className={`input pl-10 ${touched[name] && errors[name] ? "border-red-400" : ""}`}
        {...extra}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiActivity className="text-white" size={20} />
            </div>
            <span className="font-bold text-2xl text-slate-800">MedAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1">Join MedAI Healthcare Platform</p>
        </div>

        <div className="card shadow-xl">
          {error   && <div className="mb-4"><Alert type="error"   message={error}   onClose={() => setError("")} /></div>}
          {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {["patient", "doctor"].map((r) => (
                  <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    values.role === r ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}>
                    <input type="radio" name="role" value={r} checked={values.role === r} onChange={handleChange} className="hidden" />
                    <span className="text-lg">{r === "patient" ? "🧑" : "👨‍⚕️"}</span>
                    <span className="font-medium text-slate-700 capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Common */}
            <Field label="Full Name" error={touched.name && errors.name}>
              <Inp name="name" placeholder="John Smith" icon={<FiUser size={16} />} />
            </Field>

            <Field label="Email Address" error={touched.email && errors.email}>
              <Inp name="email" placeholder="you@example.com" icon={<FiMail size={16} />} type="email" />
            </Field>

            <Field label="Password" error={touched.password && errors.password}>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  name="password" type={showPass ? "text" : "password"}
                  value={values.password} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Min 8 characters"
                  className={`input pl-10 pr-10 ${touched.password && errors.password ? "border-red-400" : ""}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </Field>

            {/* Gender */}
            <Field label="Gender" error={touched.gender && errors.gender}>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className={`flex items-center justify-center p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                    values.gender === g ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}>
                    <input type="radio" name="gender" value={g} checked={values.gender === g} onChange={handleChange} className="hidden" />
                    {g}
                  </label>
                ))}
              </div>
            </Field>

            {/* ── Patient fields ── */}
            {!isDoctor && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age" error={touched.age && errors.age}>
                    <Inp name="age" placeholder="e.g. 30" icon={<FiUser size={16} />} type="number" extra={{ min: 1, max: 120 }} />
                  </Field>
                  <Field label="Phone">
                    <Inp name="phone" placeholder="+92 300 0000000" icon={<FiPhone size={16} />} />
                  </Field>
                </div>

                <Field label="Blood Group">
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <label key={bg} className={`flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${
                        values.blood_group === bg ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>
                        <input type="radio" name="blood_group" value={bg} checked={values.blood_group === bg} onChange={handleChange} className="hidden" />
                        {bg}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Address (optional)">
                  <Inp name="address" placeholder="City, Country" icon={<FiMapPin size={16} />} />
                </Field>
              </>
            )}

            {/* ── Doctor fields ── */}
            {isDoctor && (
              <>
                <Field label="Specialization" error={touched.specialization && errors.specialization}>
                  <div className="relative">
                    <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      name="specialization" value={values.specialization}
                      onChange={handleChange} onBlur={handleBlur}
                      className={`input pl-10 ${touched.specialization && errors.specialization ? "border-red-400" : ""}`}
                    >
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </Field>

                <Field label="Hospital / Clinic" error={touched.hospital && errors.hospital}>
                  <Inp name="hospital" placeholder="e.g. City Hospital" icon={<FiHome size={16} />} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="License Number">
                    <Inp name="license_number" placeholder="e.g. PMC-12345" icon={<FiAward size={16} />} />
                  </Field>
                  <Field label="Phone">
                    <Inp name="doctor_phone" placeholder="+92 300 0000000" icon={<FiPhone size={16} />} />
                  </Field>
                </div>
              </>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
