import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiShield, FiZap, FiUpload, FiCpu, FiFileText } from "react-icons/fi";
import Button from "../components/Button";

import brainIcon  from "../../icons_home_page/brain.png";
import breastIcon from "../../icons_home_page/breast.png";
import chestIcon  from "../../icons_home_page/chest.png";
import skinIcon   from "../../icons_home_page/skin.png";
import heartIcon  from "../../icons_home_page/heart.png";

const diseases = [
  { label: "Brain Tumor",   sub: "MRI Scan",         to: "/brain-tumor",   icon: brainIcon,  bg: "from-purple-50 to-purple-100", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  { label: "Breast Cancer", sub: "Ultrasound",        to: "/breast-cancer", icon: breastIcon, bg: "from-pink-50 to-pink-100",     border: "border-pink-200",   text: "text-pink-700",   dot: "bg-pink-500"   },
  { label: "Pneumonia",     sub: "Chest X-Ray",       to: "/pneumonia",     icon: chestIcon,  bg: "from-blue-50 to-blue-100",     border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  { label: "Skin Cancer",   sub: "Dermoscopy Image",  to: "/skin-cancer",   icon: skinIcon,   bg: "from-orange-50 to-orange-100", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  { label: "Heart Disease", sub: "Clinical Data",     to: "/heart",         icon: heartIcon,  bg: "from-red-50 to-red-100",       border: "border-red-200",    text: "text-red-700",    dot: "bg-red-500"    },
];

const stats = [
  { value: "5",    label: "AI Models"       },
  { value: "95%+", label: "Accuracy Rate"   },
  { value: "< 3s", label: "Detection Speed" },
  { value: "Free", label: "Open Access"     },
];

const steps = [
  { icon: FiUpload,   title: "Upload Image",      desc: "Upload your medical scan or fill in clinical data"  },
  { icon: FiCpu,      title: "AI Analysis",        desc: "Our deep learning model analyzes your input instantly" },
  { icon: FiFileText, title: "Get Report",         desc: "Download a professional PDF diagnostic report"     },
];

const Home = () => (
  <div className="min-h-screen bg-white">

    {/* ── NAVBAR ─────────────────────────────────────────────── */}
    <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <FiActivity className="text-white" size={18} />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 leading-none block">MedAI</span>
            <span className="text-xs text-slate-400 leading-none">Disease Detection</span>
          </div>
        </div>
        <Link to="/brain-tumor">
          <Button size="sm">Launch App <FiArrowRight size={14} /></Button>
        </Link>
      </div>
    </nav>

    {/* ── HERO ───────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-sm font-medium mb-8">
        <FiZap size={13} />
        AI-Powered Medical Diagnostics
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
        Detect Diseases with<br />
        <span className="text-blue-600">Artificial Intelligence</span>
      </h1>

      <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
        Upload a medical image and get an instant AI-powered diagnosis for 5 critical diseases — with a downloadable PDF report.
      </p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link to="/brain-tumor">
          <Button size="lg">Start Free Detection <FiArrowRight /></Button>
        </Link>
        <a href="#diseases" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          View all diseases ↓
        </a>
      </div>
    </section>

    {/* ── STATS BAR ──────────────────────────────────────────── */}
    <section className="bg-slate-900 py-10">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── DISEASE CARDS ──────────────────────────────────────── */}
    <section id="diseases" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Diseases We Detect</h2>
        <p className="text-slate-500">Click any card to start detection</p>
      </div>

      <div className="grid md:grid-cols-5 gap-5">
        {diseases.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className={`group relative flex flex-col items-center text-center p-6 rounded-2xl border bg-gradient-to-b ${d.bg} ${d.border} hover:shadow-xl hover:-translate-y-2 transition-all duration-300`}
          >
            {/* Active dot */}
            <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${d.dot}`} />

            {/* Icon */}
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <img
                src={d.icon}
                alt={d.label}
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <p className={`font-bold text-sm ${d.text} mb-1`}>{d.label}</p>
            <p className="text-xs text-slate-400">{d.sub}</p>

            <div className={`mt-4 text-xs font-semibold ${d.text} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              Detect Now <FiArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* ── HOW IT WORKS ───────────────────────────────────────── */}
    <section className="bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
          <p className="text-slate-500">3 simple steps to get your diagnosis</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-slate-200 z-0" />

          {steps.map((s, i) => (
            <div key={i} className="relative z-10 bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <s.icon className="text-white" size={22} />
              </div>
              <div className="absolute -top-3 -right-3 w-7 h-7 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {i + 1}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── TRUST STRIP ────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: FiZap,    title: "Instant Results",    desc: "Get AI predictions in under 3 seconds"              },
          { icon: FiShield, title: "Privacy First",      desc: "Images are processed locally and never stored"      },
          { icon: FiCpu,    title: "Deep Learning",      desc: "Models trained on thousands of medical images"      },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <f.icon className="text-blue-600" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA ────────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div className="bg-blue-600 rounded-3xl px-10 py-14 text-center relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 rounded-full opacity-40" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-700 rounded-full opacity-30" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Detect?</h2>
          <p className="text-blue-100 mb-8 text-lg">No signup required. Upload your scan and get results instantly.</p>
          <Link to="/brain-tumor">
            <button className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-lg">
              Start Detection Now <FiArrowRight className="inline ml-1" size={15} />
            </button>
          </Link>
        </div>
      </div>
    </section>

    {/* ── FOOTER ─────────────────────────────────────────────── */}
    <footer className="border-t border-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiActivity className="text-white" size={13} />
          </div>
          <span className="font-bold text-slate-800">MedAI</span>
        </div>
        <p className="text-slate-400 text-sm text-center">
          AI-generated results are for informational purposes only. Always consult a qualified physician.
        </p>
        <p className="text-slate-400 text-sm">&copy; 2024 MedAI</p>
      </div>
    </footer>

  </div>
);

export default Home;
