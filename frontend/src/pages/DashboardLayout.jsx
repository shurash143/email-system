import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import   "../pages/DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MOBILE TOP BAR */}
      <header className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <strong>CargoMail</strong>
      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
}