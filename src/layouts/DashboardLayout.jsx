import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FiActivity, FiMenu, FiX, FiHeart } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";

const navItems = [
  { to: "/brain-tumor",   icon: GiBrain,      label: "Brain Tumor" },
  { to: "/breast-cancer", icon: FiActivity,   label: "Breast Cancer" },
  { to: "/pneumonia",     icon: FiActivity,   label: "Pneumonia" },
  { to: "/skin-cancer",   icon: FiActivity,   label: "Skin Cancer" },
  { to: "/heart",         icon: FiHeart,      label: "Heart Disease" },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <FiActivity className="text-white" size={18} />
        </div>
        <span className="font-bold text-slate-800 text-lg">MedAI</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiActivity className="text-white" size={14} />
            </div>
            <span className="font-bold text-slate-800">MedAI — Disease Detection</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
