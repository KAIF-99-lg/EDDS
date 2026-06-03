import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import logoImg from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Alert from "../components/Alert";

const validate = (v) => {
  const e = {};
  if (!v.email) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Invalid email";
  if (!v.password) e.password = "Password is required";
  return e;
};

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { email: "", password: "" }, validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true); setError("");
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
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
      background: "radial-gradient(ellipse at 30% 30%, #0a0f1e 0%, #060910 60%, #000 100%)",
    }}>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow */}
      <div className="fixed pointer-events-none" style={{
        top: "20%", left: "10%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(0,100,255,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* ── LEFT PANEL — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10"
        style={{ borderRight: "1px solid rgba(0,200,255,0.08)" }}>

        <Link to="/">
          <img src={logoImg} alt="TrueMD" className="h-10 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }} />
        </Link>

        <div>
          <div className="text-xs font-mono tracking-widest text-cyan-400 mb-4 uppercase">// AI Diagnostic System</div>
          <h1 className="text-5xl font-black leading-none mb-6">
            MEDICAL<br />
            <span style={{ background: "linear-gradient(90deg,#00c8ff,#0066ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              INTELLIGENCE
            </span>
          </h1>
          <p className="text-slate-500 font-mono text-sm leading-relaxed max-w-sm">
            AI-powered disease detection for Brain Tumor, Breast Cancer, Pneumonia, Skin Cancer and Heart Disease.
          </p>

          <div className="flex gap-10 mt-12">
            {[["5+", "AI MODELS"], ["99%", "ACCURACY"], ["&lt;3s", "RESPONSE"]].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-black" style={{ color: "#00c8ff" }}
                  dangerouslySetInnerHTML={{ __html: v }} />
                <div className="text-xs font-mono text-slate-600 tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-700">
          © 2026 TrueMD — All systems operational
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative z-10">

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-10">
          <img src={logoImg} alt="TrueMD" className="h-9 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }} />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <div className="text-xs font-mono tracking-widest text-cyan-400 mb-2 uppercase">// Auth Portal</div>
          <h2 className="text-3xl font-black text-white mb-1">WELCOME BACK</h2>
          <p className="text-slate-500 text-sm font-mono mb-8">Authenticate to access the system</p>

          {error && <div className="mb-5"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          {/* Google */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed. Please try again.")}
              width="100%"
              theme="filled_black"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(0,200,255,0.1)" }} />
            <span className="text-xs font-mono text-slate-600">OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(0,200,255,0.1)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono tracking-widest text-slate-500 mb-2 uppercase">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                <input name="email" type="email" value={values.email}
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 text-sm font-mono bg-transparent outline-none text-white placeholder-slate-700 transition-all"
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
                  onChange={handleChange} onBlur={handleBlur}
                  placeholder="••••••••"
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
                </svg> AUTHENTICATING...</>
              ) : "LOGIN →"}
            </button>
          </form>

          <p className="text-center text-xs font-mono text-slate-600 mt-8">
            No account?{" "}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">CREATE ONE</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
