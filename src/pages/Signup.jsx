import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import Alert from "../components/Alert";
import Footer from "../components/Footer";
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.8C9.6 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
  </svg>
);

const Signup = () => {
  const { signup, googleLogin } = useAuth();
  const navigate   = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    { name: "", email: "", password: "" }, validate
  );

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

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
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #e8f0fe 100%)" }}>

      <div className="flex-1 flex items-center justify-center p-4 py-8">
        {/* ── CARD ── */}
        <div className="w-full flex overflow-hidden rounded-2xl shadow-2xl" style={{ maxWidth: 1100, height: "85vh", minHeight: 580 }}>

          {/* ── LEFT — FORM ── */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 py-8 overflow-y-auto">

            <Link to="/" className="mb-5 inline-block">
              <img src={logoImg} alt="TrueMD" className="h-9 w-auto object-contain" />
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
            <p className="text-slate-500 text-sm mb-5">Join TrueMD Healthcare Platform</p>

            {error   && <div className="mb-3"><Alert type="error"   message={error}   onClose={() => setError("")} /></div>}
            {success && <div className="mb-3"><Alert type="success" message={success} /></div>}

            {/* Google */}
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed. Please try again.")}
                width="100%"
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">or continue with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur}
                    placeholder="John Smith"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none bg-slate-50
                      transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${touched.name && errors.name ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
                </div>
                {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl outline-none bg-slate-50
                      transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${touched.email && errors.email ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
                </div>
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input name="password" type={showPass ? "text" : "password"} value={values.password}
                    onChange={handleChange} onBlur={handleBlur} placeholder="Min 8 characters"
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl outline-none bg-slate-50
                      transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${touched.password && errors.password ? "border-red-400 bg-red-50" : "border-slate-200"}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {touched.password && errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 mt-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold
                  rounded-xl transition-all duration-200 shadow-md shadow-blue-200 disabled:opacity-60
                  flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg> Creating...</>
                ) : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {/* ── RIGHT — IMAGE ── */}
          <div className="hidden lg:block w-1/2 relative overflow-hidden">
            <img src={loginImg} alt="TrueMD Healthcare" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,80,0.92) 0%, rgba(29,78,216,0.5) 45%, rgba(0,0,0,0.1) 100%)" }} />

            {/* Bottom branding */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <img src={logoImg} alt="TrueMD" className="h-8 w-auto brightness-0 invert mb-4 opacity-90" />
              <h2 className="text-white text-xl font-bold mb-2">Join TrueMD Today</h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-5">
                AI-powered disease detection at your fingertips. Fast, secure and intelligent.
              </p>
              <div className="flex gap-8">
                {[["5+", "AI Models"], ["99%", "Accuracy"], ["24/7", "Available"]].map(([val, label]) => (
                  <div key={label}>
                    <p className="text-white font-bold text-base">{val}</p>
                    <p className="text-blue-300 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
