import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../services/api";
import "./Settings.css";

export default function Settings() {
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    department: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    newEmail: true,
    emailSent: true,
    accountUpdates: true,
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/auth/me");

      const currentUser = response.data.user;

      setUser(currentUser);

      setProfile({
        name: currentUser?.name || "",
        department: currentUser?.department || "",
      });

      if (currentUser?.notificationSettings) {
        setNotifications({
          newEmail:
            currentUser.notificationSettings.newEmail ?? true,
          emailSent:
            currentUser.notificationSettings.emailSent ?? true,
          accountUpdates:
            currentUser.notificationSettings.accountUpdates ?? true,
        });
      }
    } catch (err) {
      console.error("Settings loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);
      setMessage("");
      setError("");

      const response = await API.put(
        "/auth/settings/profile",
        profile
      );

      setUser(response.data.user);

      setMessage("Profile settings saved successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    try {
      setChangingPassword(true);

      await API.put("/auth/settings/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (err) {
      console.error("Password change error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setMessage("");
      setError("");

      await API.put(
        "/auth/settings/notifications",
        notifications
      );

      setMessage("Notification settings saved.");
    } catch (err) {
      console.error("Notification settings error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save notification settings."
      );
    }
  };

  if (loading) {
    return (
      <section className="settings-page">
        <div className="settings-loading">
          Loading settings...
        </div>
      </section>
    );
  }

  return (
    <section className="settings-page">
      <div className="page-heading">
        <span className="eyebrow">ACCOUNT</span>

        <h1>Settings</h1>

        <p className="muted">
          Manage your CargoMail account and preferences.
        </p>
      </div>

      {message && (
        <div className="settings-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="settings-alert error">
          {error}
        </div>
      )}

      {/* PROFILE */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-icon">
            <User size={21} />
          </div>

          <div>
            <h2>Profile</h2>
            <p>
              Update your personal company email information.
            </p>
          </div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="settings-form-grid">
            <div className="form-group">
              <label>Full name</label>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                value={user?.email || ""}
                disabled
              />

              <small>
                Your company email address cannot be changed
                here.
              </small>
            </div>

            <div className="form-group">
              <label>Department</label>

              <input
                type="text"
                name="department"
                value={profile.department}
                onChange={handleProfileChange}
                placeholder="e.g. Operations"
              />
            </div>

            <div className="form-group">
              <label>Account role</label>

              <input
                type="text"
                value={user?.role || "employee"}
                disabled
              />
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="settings-btn"
              disabled={savingProfile}
            >
              <Save size={17} />

              {savingProfile
                ? "Saving..."
                : "Save profile"}
            </button>
          </div>
        </form>
      </div>

      {/* PASSWORD */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-icon">
            <Lock size={21} />
          </div>

          <div>
            <h2>Security</h2>
            <p>
              Keep your CargoMail account secure.
            </p>
          </div>
        </div>

        <form onSubmit={changePassword}>
          <div className="password-grid">
            <div className="form-group full">
              <label>Current password</label>

              <div className="password-input">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrent(!showCurrent)
                  }
                >
                  {showCurrent ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New password</label>

              <div className="password-input">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm new password</label>

              <div className="password-input">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="submit"
              className="settings-btn"
              disabled={changingPassword}
            >
              <Lock size={17} />

              {changingPassword
                ? "Changing..."
                : "Change password"}
            </button>
          </div>
        </form>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-icon">
            <Bell size={21} />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>
              Choose which CargoMail notifications you receive.
            </p>
          </div>
        </div>

        <div className="notification-list">
          <label className="notification-item">
            <div>
              <strong>New email notifications</strong>
              <span>
                Notify me when new emails arrive.
              </span>
            </div>

            <input
              type="checkbox"
              name="newEmail"
              checked={notifications.newEmail}
              onChange={handleNotificationChange}
            />
          </label>

          <label className="notification-item">
            <div>
              <strong>Email sent notifications</strong>
              <span>
                Notify me when an email is successfully sent.
              </span>
            </div>

            <input
              type="checkbox"
              name="emailSent"
              checked={notifications.emailSent}
              onChange={handleNotificationChange}
            />
          </label>

          <label className="notification-item">
            <div>
              <strong>Account updates</strong>
              <span>
                Receive important account and security updates.
              </span>
            </div>

            <input
              type="checkbox"
              name="accountUpdates"
              checked={notifications.accountUpdates}
              onChange={handleNotificationChange}
            />
          </label>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-btn"
            onClick={saveNotifications}
          >
            <Save size={17} />
            Save notifications
          </button>
        </div>
      </div>
    </section>
  );
}