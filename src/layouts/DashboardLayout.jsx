import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { FiActivity, FiMenu, FiHeart, FiHome, FiClock, FiFileText, FiUser, FiLogOut } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useAuth } from "../hooks/useAuth";

const detectNav = [
  { to: "/brain-tumor",   icon: GiBrain,      label: "Brain Tumor" },
  { to: "/breast-cancer", icon: FiActivity,   label: "Breast Cancer" },
  { to: "/pneumonia",     icon: FiActivity,   label: "Pneumonia" },
  { to: "/skin-cancer",   icon: FiActivity,   label: "Skin Cancer" },
  { to: "/heart",         icon: FiHeart,      label: "Heart Disease" },
];

const userNav = [
  { to: "/dashboard",  icon: FiHome,     label: "Dashboard" },
  { to: "/brain-tumor",icon: GiBrain,    label: "Brain Tumor" },
  { to: "/breast-cancer", icon: FiActivity, label: "Breast Cancer" },
  { to: "/pneumonia",  icon: FiActivity, label: "Pneumonia" },
  { to: "/skin-cancer",icon: FiActivity, label: "Skin Cancer" },
  { to: "/heart",      icon: FiHeart,    label: "Heart Disease" },
  { to: "/history",    icon: FiClock,    label: "History" },
  { to: "/reports",    icon: FiFileText, label: "My Reports" },
  { to: "/profile",    icon: FiUser,     label: "Profile" },
];

const DashboardLayout = ({ showUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const navItems = showUser ? userNav : detectNav;

  const handleLogout = () => { logout?.(); navigate("/"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <FiActivity className="text-white" size={18} />
        </div>
        <span className="font-bold text-slate-800 text-lg">MedAI</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}>
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {showUser && user && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser className="text-blue-600" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <FiLogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
              <FiMenu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiActivity className="text-white" size={14} />
              </div>
              <span className="font-bold text-slate-800">MedAI</span>
            </div>
          </div>
          {!showUser && (
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
              Sign In
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
