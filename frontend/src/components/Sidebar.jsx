import { NavLink, useNavigate } from "react-router-dom";
import {
  Archive,
  Inbox,
  Mail,
  Send,
  FileText,
  Star,
  Trash2,
  Users,
  Settings,
  X,
  ShieldCheck,
  LogOut,
  Plus,
} from "lucide-react";
import API from "../services/api";
import "./Sidebar.css";

import multimodal from "../assets/multimodal.jpeg";

const items = [
  { to: "/", label: "Inbox", icon: Inbox },
  { to: "/sent", label: "Sent", icon: Send },
  { to: "/drafts", label: "Drafts", icon: FileText },
  { to: "/starred", label: "Starred", icon: Star },
  { to: "/archive", label: "Archive", icon: Archive },
  { to: "/trash", label: "Trash", icon: Trash2 },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.log("Logout request failed");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

        {/* BRAND */}
        <div className="sidebar-brand">

          <div className="brand-mark">
            <img src={multimodal} alt="CargoMail" className="sidebar-logo" />
          </div>

          <div className="brand-text">
            <strong>CargoMail</strong>
            <span>Professional Email</span>
          </div>

          <button
            className="icon-btn mobile-only"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        </div>

        {/* COMPOSE */}
        <div className="compose-wrapper">
          <NavLink
            to="/compose"
            className="compose-btn"
            onClick={onClose}
          >
            <Plus size={19} />
            <span>Compose</span>
          </NavLink>
        </div>

        {/* NAVIGATION */}
        <nav className="mail-nav">

          <div className="nav-label">
            MAIL
          </div>

          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-label nav-gap">
            CONTACTS
          </div>

          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Users size={18} />
            <span>Contacts</span>
          </NavLink>

          <div className="nav-label nav-gap">
            SETTINGS
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>

        </nav>

        {/* BOTTOM */}
        <div className="sidebar-bottom">

          <div className="mailbox-card">

            <div className="mailbox-icon">
              <Mail size={17} />
            </div>

            <div className="mailbox-info">
              <strong>Mailbox</strong>
              <span>Connected</span>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}