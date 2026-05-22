import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiActivity, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Button from "../components/Button";
import Alert from "../components/Alert";

const validate = (v) => {
  const e = {};
  if (!v.name)     e.name     = "Name is required";
  if (!v.email)    e.email    = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email";
  if (!v.password) e.password = "Password is required";
  else if (v.password.length < 8) e.password = "Min 8 characters";
  return e;
};

const Signup = () => {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { name: "", email: "", password: "" },
    validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true); setError("");
    try {
      await signup(values);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Signup failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="John Smith" className={`input pl-10 ${touched.name && errors.name ? "border-red-400" : ""}`} />
              </div>
              {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="you@example.com" className={`input pl-10 ${touched.email && errors.email ? "border-red-400" : ""}`} />
              </div>
              {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input name="password" type={showPass ? "text" : "password"} value={values.password}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Min 8 characters"
                  className={`input pl-10 pr-10 ${touched.password && errors.password ? "border-red-400" : ""}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
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
