import { Link } from "react-router-dom";
import { FiTwitter, FiLinkedin, FiInstagram, FiGithub, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { RiHeartPulseFill } from "react-icons/ri";
import logoImg from "../assets/logo.png";

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400">
    {/* Top wave */}
    <div className="w-full overflow-hidden leading-none">
      <svg viewBox="0 0 1440 40" className="w-full fill-slate-100" preserveAspectRatio="none">
        <path d="M0,40 C360,0 1080,0 1440,40 L1440,0 L0,0 Z" />
      </svg>
    </div>

    <div className="max-w-6xl mx-auto px-6 pt-4 pb-10">
      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoImg} alt="TrueMD" className="h-9 w-auto object-contain brightness-0 invert" />
          </div>
          <p className="text-sm leading-relaxed mb-5">
            AI-powered medical platform for intelligent disease detection and patient health monitoring.
          </p>
          {/* Contact */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <FiMail size={12} className="text-blue-400 flex-shrink-0" />
              <span>support@TrueMD.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone size={12} className="text-blue-400 flex-shrink-0" />
              <span>+1 (800) ZEN-MEDI</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: "Dashboard",    to: "/dashboard" },
              { label: "AI Detection", to: "/brain-tumor" },
              { label: "My Reports",   to: "/reports" },
              { label: "History",      to: "/history" },
              { label: "Profile",      to: "/profile" },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-sm">
            {["About Us", "Contact", "Careers", "Blog", "Press"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal + Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2.5 text-sm mb-6">
            {["Privacy Policy", "Terms & Conditions", "Cookie Policy", "HIPAA Compliance"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {l}
                </a>
              </li>
            ))}
          </ul>

          {/* Newsletter */}
          <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">Newsletter</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-medium">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <RiHeartPulseFill className="text-blue-500" size={14} />
          <span>© 2026 TrueMD. All rights reserved.</span>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-2">
          {[
            { Icon: FiTwitter,  href: "#" },
            { Icon: FiLinkedin, href: "#" },
            { Icon: FiInstagram,href: "#" },
            { Icon: FiGithub,   href: "#" },
          ].map(({ Icon, href }, i) => (
            <a key={i} href={href}
              className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110">
              <Icon size={14} className="text-slate-400 hover:text-white" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
