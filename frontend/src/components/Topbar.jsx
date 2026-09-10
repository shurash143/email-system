import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import "./Topbar.css"

export default function Topbar({
  onMenu,
  search,
  setSearch,
  user,
}) {
  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-menu"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="search-box">
        <Search size={18} />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emails, senders, subjects..."
        />

        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn notification"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <i />
        </button>

        <div className="user-chip">
          <div className="avatar">
            {(user?.name || "A")
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div className="user-text">
            <strong>
              {user?.name || "Administrator"}
            </strong>

            <span>
              {user?.email ||
                "admin@cargocompany.com"}
            </span>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}