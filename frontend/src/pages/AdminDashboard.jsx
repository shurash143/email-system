import {
  Users,
  UserCheck,
  Mail,
  MailOpen,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard({
  stats,
  onRefresh,
}) {
  const data = stats || {};

  return (
    <section>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h1>Dashboard</h1>

          <p className="muted">
            Manage your company email system.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={onRefresh}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <span>Employees</span>

          <strong>
            {data.employees ??
              data.totalUsers ??
              0}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserCheck size={22} />
          </div>

          <span>Active Users</span>

          <strong>
            {data.activeEmployees ??
              data.activeUsers ??
              0}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Mail size={22} />
          </div>

          <span>Total Emails</span>

          <strong>
            {data.totalEmails ?? 0}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MailOpen size={22} />
          </div>

          <span>Unread Emails</span>

          <strong>
            {data.unread ?? data.unreadEmails ?? 0}
          </strong>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Company Email System</h2>

        <p>
          From this dashboard you will be able to
          manage employees, shared mailboxes,
          company settings, SMTP and IMAP
          configuration, and security.
        </p>

        <div className="admin-actions">
          <button className="primary-btn">
            Add Employee
          </button>

          <button className="secondary-btn">
            Manage Mailboxes
          </button>
        </div>
      </div>
    </section>
  );
}