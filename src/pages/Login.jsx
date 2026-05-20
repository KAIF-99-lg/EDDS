import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiActivity, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Button from "../components/Button";
import Alert from "../components/Alert";

const validate = (v) => {
  const e = {};
  if (!v.email) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email";
  if (!v.password) e.password = "Password is required";
  return e;
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { email: "", password: "" }, validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    setError("");
    try {
      const data = await login(values.email, values.password);
      navigate(data.user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiActivity className="text-white" size={20} />
            </div>
            <span className="font-bold text-2xl text-slate-800">MedAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card shadow-xl">
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="email" type="email" value={values.email} onChange={handleChange}
                  onBlur={handleBlur} placeholder="you@example.com"
                  className={`input pl-10 ${touched.email && errors.email ? "border-red-400" : ""}`} />
              </div>
              {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input name="password" type={showPass ? "text" : "password"} value={values.password}
                  onChange={handleChange} onBlur={handleBlur} placeholder="••••••••"
                  className={`input pl-10 pr-10 ${touched.password && errors.password ? "border-red-400" : ""}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
