import { Link } from "react-router-dom";
import { FiArrowRight, FiUser } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import logoImg from "../assets/logo.png";

import brainIcon  from "../../icons_home_page/brain.png";
import breastIcon from "../../icons_home_page/breast.png";
import chestIcon  from "../../icons_home_page/chest.png";
import skinIcon   from "../../icons_home_page/skin.png";
import heartIcon  from "../../icons_home_page/heart.png";

const diseases = [
  { label: "Brain Tumor",   sub: "MRI Scan",        to: "/brain-tumor",   icon: brainIcon,  accent: "#a855f7" },
  { label: "Breast Cancer", sub: "Ultrasound",       to: "/breast-cancer", icon: breastIcon, accent: "#ec4899" },
  { label: "Pneumonia",     sub: "Chest X-Ray",      to: "/pneumonia",     icon: chestIcon,  accent: "#38bdf8" },
  { label: "Skin Cancer",   sub: "Dermoscopy Image", to: "/skin-cancer",   icon: skinIcon,   accent: "#fb923c" },
  { label: "Heart Disease", sub: "Clinical Data",    to: "/heart",         icon: heartIcon,  accent: "#f43f5e" },
];

const Home = () => {
  const { isAuthenticated } = useAuth() || {};

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{
      background: "radial-gradient(ellipse at 20% 20%, #0a0f1e 0%, #060910 60%, #000000 100%)",
    }}>

      {/* ── HUD Grid overlay ── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* ── Corner HUD brackets ── */}
      <div className="fixed top-4 left-4 w-12 h-12 pointer-events-none z-10"
        style={{ borderTop: "2px solid #00c8ff", borderLeft: "2px solid #00c8ff", opacity: 0.5 }} />
      <div className="fixed top-4 right-4 w-12 h-12 pointer-events-none z-10"
        style={{ borderTop: "2px solid #00c8ff", borderRight: "2px solid #00c8ff", opacity: 0.5 }} />
      <div className="fixed bottom-4 left-4 w-12 h-12 pointer-events-none z-10"
        style={{ borderBottom: "2px solid #00c8ff", borderLeft: "2px solid #00c8ff", opacity: 0.5 }} />
      <div className="fixed bottom-4 right-4 w-12 h-12 pointer-events-none z-10"
        style={{ borderBottom: "2px solid #00c8ff", borderRight: "2px solid #00c8ff", opacity: 0.5 }} />

      {/* ── Glow orbs ── */}
      <div className="fixed pointer-events-none z-0" style={{
        top: "10%", left: "5%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />
      <div className="fixed pointer-events-none z-0" style={{
        top: "40%", right: "5%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
      }} />

      {/* ── NAVBAR ── */}
      <nav className="relative z-50 px-8 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.1)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="TrueMD" className="h-9 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase opacity-70">v2.0 SYSTEM</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono text-cyan-400 opacity-60 hidden md:block">
            SYS_STATUS: <span className="text-green-400">ONLINE</span>
          </span>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
              style={{
                border: "1px solid rgba(0,200,255,0.5)",
                color: "#00c8ff",
                background: "rgba(0,200,255,0.05)",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}>
              <FiUser size={14} />
              {isAuthenticated ? "DASHBOARD" : "SIGN IN"}
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 text-xs font-mono tracking-widest uppercase"
          style={{ border: "1px solid rgba(0,200,255,0.3)", color: "#00c8ff", background: "rgba(0,200,255,0.05)" }}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          AI DIAGNOSTIC SYSTEM — ACTIVE
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none tracking-tight">
          <span style={{ color: "#e2e8f0" }}>MEDICAL</span>
          <br />
          <span style={{
            background: "linear-gradient(90deg, #00c8ff, #0066ff, #00c8ff)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>INTELLIGENCE</span>
        </h1>

        <p className="text-slate-400 text-lg mb-4 max-w-2xl mx-auto font-mono leading-relaxed">
          Upload a medical scan. AI analyzes in seconds.
          <br />Get a professional diagnostic report instantly.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-10 mb-12 mt-8">
          {[["5", "AI MODELS"], ["99%", "ACCURACY"], ["&lt;3s", "RESPONSE"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black" style={{ color: "#00c8ff" }}
                dangerouslySetInnerHTML={{ __html: val }} />
              <div className="text-xs font-mono text-slate-500 tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

        <Link to="/brain-tumor">
          <button className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0066ff, #00c8ff)",
              clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
              boxShadow: "0 0 30px rgba(0,200,255,0.3)",
            }}>
            INITIALIZE SCAN <FiArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* ── DISEASE CARDS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="text-xs font-mono tracking-widest text-cyan-400 mb-3 uppercase">// Detection Modules</div>
          <h2 className="text-4xl font-black text-white">SELECT TARGET</h2>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {diseases.map((d) => (
            <Link key={d.to} to={d.to} className="group relative block p-5 transition-all duration-300 hover:-translate-y-2"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = d.accent + "80"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-3 h-3 transition-all duration-300"
                style={{ background: d.accent, opacity: 0.4, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />

              <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center rounded-lg overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${d.accent}30` }}>
                <img src={d.icon} alt={d.label} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                  style={{ filter: "brightness(0) invert(1)" }} />
              </div>

              <p className="font-bold text-sm text-white text-center mb-1">{d.label}</p>
              <p className="text-xs text-center font-mono" style={{ color: d.accent, opacity: 0.8 }}>{d.sub}</p>

              <div className="mt-4 flex items-center justify-center gap-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: d.accent }}>
                RUN SCAN <FiArrowRight size={10} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}>
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-14">
            <div className="text-xs font-mono tracking-widest text-cyan-400 mb-3 uppercase">// Protocol</div>
            <h2 className="text-4xl font-black text-white">OPERATION SEQUENCE</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "UPLOAD SCAN",   desc: "Upload your medical image or provide clinical data to the system" },
              { num: "02", title: "AI ANALYSIS",   desc: "Deep learning model processes and analyzes your input in real-time" },
              { num: "03", title: "GET REPORT",    desc: "Download a professional PDF diagnostic report instantly" },
            ].map((s) => (
              <div key={s.num} className="relative p-6"
                style={{
                  background: "rgba(0,200,255,0.02)",
                  border: "1px solid rgba(0,200,255,0.1)",
                  clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
                }}>
                <div className="text-5xl font-black mb-4 font-mono"
                  style={{ color: "rgba(0,200,255,0.15)" }}>{s.num}</div>
                <h3 className="font-bold text-white text-sm tracking-widest mb-2 font-mono">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-20">
        <div className="relative p-16 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,200,255,0.05) 100%)",
            border: "1px solid rgba(0,200,255,0.2)",
          }}>
          {/* Scan line animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-full h-px opacity-20" style={{
              background: "linear-gradient(90deg, transparent, #00c8ff, transparent)",
              animation: "scanline 3s linear infinite",
              top: "50%",
            }} />
          </div>

          <style>{`@keyframes scanline { 0% { top: 0% } 100% { top: 100% } }`}</style>

          <div className="text-xs font-mono tracking-widest text-cyan-400 mb-4 uppercase">// System Ready</div>
          <h2 className="text-4xl font-black text-white mb-4">READY TO SCAN?</h2>
          <p className="text-slate-400 mb-10 font-mono text-sm">Account required. Upload your scan. Get instant results.</p>
          <Link to="/signup">
            <button className="inline-flex items-center gap-3 px-12 py-4 text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #0066ff, #00c8ff)",
                clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
                boxShadow: "0 0 40px rgba(0,200,255,0.25)",
              }}>
              CREATE ACCOUNT <FiArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 px-8 py-6 text-center font-mono text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(0,200,255,0.08)" }}>
        © 2026 TrueMD — AI Healthcare Platform &nbsp;|&nbsp; All systems operational
      </footer>

    </div>
  );
};

export default Home;
