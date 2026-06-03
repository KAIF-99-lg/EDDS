import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Alert from "../components/Alert";
import logoImg from "../assets/logo.png";
import loginImg from "../assets/login_signup_page image.jpeg";

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
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { name: "", email: "", password: "" }, validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true); setError("");
    try {
      await signup(values);
      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Signup failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex text-white" style={{
      background: "radial-gradient(ellipse at 70% 30%, #0a0f1e 0%, #060910 60%, #000 100%)",
    }}>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow */}
      <div className="fixed pointer-events-none" style={{
        top: "10%", right: "10%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(0,100,255,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* ── LEFT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10 py-12">

        <Link to="/" className="mb-10">
          <img src={logoImg} alt="TrueMD" className="h-9 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }} />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="text-xs font-mono tracking-widest text-cyan-400 mb-2 uppercase">// New User Registration</div>
          <h2 className="text-3xl font-black text-white mb-1">CREATE ACCOUNT</h2>
          <p className="text-slate-500 text-sm font-mono mb-8">Join the TrueMD diagnostic system</p>

          {error   && <div className="mb-4"><Alert type="error"   message={error}   onClose={() => setError("")} /></div>}
          {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

          {/* Google */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed. Please try again.")}
              width="100%"
              theme="filled_black"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(0,200,255,0.1)" }} />
            <span className="text-xs font-mono text-slate-600">OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(0,200,255,0.1)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-slate-500 mb-2 uppercase">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="John Smith"
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-transparent outline-none text-white placeholder-slate-700"
                  style={{
                    border: touched.name && errors.name ? "1px solid #f43f5e" : "1px solid rgba(0,200,255,0.15)",
                    background: "rgba(0,200,255,0.02)",
                  }} />
              </div>
              {touched.name && errors.name && <p className="text-red-400 text-xs font-mono mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-slate-500 mb-2 uppercase">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                <input name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-transparent outline-none text-white placeholder-slate-700"
                  style={{
                    border: touched.email && errors.email ? "1px solid #f43f5e" : "1px solid rgba(0,200,255,0.15)",
                    background: "rgba(0,200,255,0.02)",
                  }} />
              </div>
              {touched.email && errors.email && <p className="text-red-400 text-xs font-mono mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-slate-500 mb-2 uppercase">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                <input name="password" type={showPass ? "text" : "password"} value={values.password}
                  onChange={handleChange} onBlur={handleBlur} placeholder="Min 8 characters"
                  className="w-full pl-11 pr-12 py-3 text-sm font-mono bg-transparent outline-none text-white placeholder-slate-700"
                  style={{
                    border: touched.password && errors.password ? "1px solid #f43f5e" : "1px solid rgba(0,200,255,0.15)",
                    background: "rgba(0,200,255,0.02)",
                  }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {touched.password && errors.password && <p className="text-red-400 text-xs font-mono mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #0066ff, #00c8ff)",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                boxShadow: "0 0 20px rgba(0,200,255,0.2)",
              }}>
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg> CREATING...</>
              ) : "CREATE ACCOUNT →"}
            </button>
          </form>

          <p className="text-center text-xs font-mono text-slate-600 mt-8">
            Already registered?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">SIGN IN</Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — image ── */}
      <div className="hidden lg:block w-2/5 relative overflow-hidden">
        <img src={loginImg} alt="TrueMD" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,5,20,0.95) 0%, rgba(0,10,40,0.6) 50%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute inset-0 p-16 flex flex-col justify-between z-10">
          <div />
          <div>
            <div className="text-xs font-mono tracking-widest text-cyan-400 mb-4 uppercase">// System Features</div>
            {[
              ["INSTANT RESULTS", "Get AI predictions in under 3 seconds"],
              ["PRIVACY FIRST",   "Images processed securely, never shared"],
              ["DEEP LEARNING",   "Models trained on thousands of medical scans"],
              ["5 DISEASES",      "Brain, Breast, Lung, Skin & Heart"],
            ].map(([title, desc]) => (
              <div key={title} className="mb-5 pl-4" style={{ borderLeft: "2px solid rgba(0,200,255,0.4)" }}>
                <div className="text-sm font-bold text-white font-mono mb-1">{title}</div>
                <div className="text-xs text-slate-400 font-mono">{desc}</div>
              </div>
            ))}
          </div>
          <div className="text-xs font-mono text-slate-600">© 2026 TrueMD — All systems operational</div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
