import { Link } from "react-router-dom";
import { FiActivity, FiCheckCircle, FiArrowRight, FiShield, FiZap, FiUsers } from "react-icons/fi";
import Button from "../components/Button";

const Home = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
    {/* Navbar */}
    <nav className="glass border-b border-white/20 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiActivity className="text-white" size={18} />
          </div>
          <span className="font-bold text-xl text-slate-800">MedAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/signup"><Button>Get Started</Button></Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-6 py-20 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6 animate-fade-in">
        <FiZap size={14} />
        <span>AI-Powered Healthcare Platform</span>
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-slide-up">
        Advanced Disease Detection<br />Using <span className="text-blue-600">Artificial Intelligence</span>
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-slide-up">
        Detect pneumonia, heart disease, brain tumors, skin cancer, and breast cancer with cutting-edge AI models. Fast, accurate, and reliable.
      </p>
      <div className="flex items-center justify-center gap-4 animate-slide-up">
        <Link to="/signup"><Button size="lg">Start Free Trial <FiArrowRight /></Button></Link>
        <Link to="/login"><Button variant="outline" size="lg">Login</Button></Link>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: FiActivity, title: "5 AI Models", desc: "Pneumonia, Heart, Brain, Skin & Breast Cancer detection", color: "blue" },
          { icon: FiShield, title: "HIPAA Compliant", desc: "Your medical data is encrypted and secure", color: "green" },
          { icon: FiUsers, title: "Doctor & Patient Portals", desc: "Separate dashboards for healthcare providers and patients", color: "purple" },
        ].map((f, i) => (
          <div key={i} className="card hover:shadow-lg transition-all duration-200 group">
            <div className={`w-12 h-12 bg-${f.color}-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <f.icon className={`text-${f.color}-600`} size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
            <p className="text-slate-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Diseases */}
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Diseases We Detect</h2>
      <div className="grid md:grid-cols-5 gap-4">
        {["Pneumonia", "Heart Disease", "Brain Tumor", "Skin Cancer", "Breast Cancer"].map((d) => (
          <div key={d} className="card text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1">
            <FiCheckCircle className="text-green-500 mx-auto mb-3" size={28} />
            <p className="font-semibold text-slate-800">{d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-blue-100 mb-8 text-lg">Join thousands of healthcare professionals using MedAI</p>
        <Link to="/signup"><Button variant="secondary" size="lg">Create Free Account</Button></Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
        <p>&copy; 2024 MedAI. All rights reserved. | Healthcare AI Platform</p>
      </div>
    </footer>
  </div>
);

export default Home;
