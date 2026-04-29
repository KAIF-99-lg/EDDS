import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiActivity, FiAlertCircle, FiFileText, FiLogOut, FiMenu, FiX, FiUser, FiChevronDown, FiHeart, FiBell } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useAuth } from "../hooks/useAuth";

const patientNav = [
  { to: "/patient/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/patient/pneumonia", icon: FiActivity, label: "Pneumonia Detection" },
  { to: "/patient/heart", icon: FiHeart, label: "Heart Disease" },
  { to: "/patient/brain-tumor", icon: GiBrain, label: "Brain Tumor" },
  { to: "/patient/skin-cancer", icon: FiActivity, label: "Skin Cancer" },
  { to: "/patient/breast-cancer", icon: FiActivity, label: "Breast Cancer" },
  { to: "/patient/reports", icon: FiFileText, label: "My Reports" },
  { to: "/patient/history", icon: FiActivity, label: "Prediction History" },
  { to: "/patient/profile", icon: FiUser, label: "Profile" },
];

const doctorNav = [
  { to: "/doctor/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/doctor/patients", icon: FiUsers, label: "Patient Management" },
  { to: "/doctor/monitoring", icon: FiActivity, label: "Patient Monitoring" },
  { to: "/doctor/alerts", icon: FiAlertCircle, label: "Alerts" },
  { to: "/doctor/reports", icon: FiFileText, label: "Report Review" },
  { to: "/doctor/pneumonia", icon: FiActivity, label: "Pneumonia Detection" },
  { to: "/doctor/heart", icon: FiHeart, label: "Heart Disease" },
  { to: "/doctor/brain-tumor", icon: GiBrain, label: "Brain Tumor" },
  { to: "/doctor/skin-cancer", icon: FiActivity, label: "Skin Cancer" },
  { to: "/doctor/breast-cancer", icon: FiActivity, label: "Breast Cancer" },
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "doctor" ? doctorNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiActivity className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-none">MedAI</h1>
            <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <FiLogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <FiMenu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-slate-500 text-sm">Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500">
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 cursor-pointer">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-600" size={13} />
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
              <FiChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
