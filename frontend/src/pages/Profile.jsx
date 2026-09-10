import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
} from "lucide-react";
import API from "../services/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
      } catch (err) {
        console.error("Profile error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <section>Loading profile...</section>;
  }

  if (error) {
    return <section>{error}</section>;
  }

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">ACCOUNT</span>

        <h1>My Profile</h1>

        <p className="muted">
          Manage your company email profile.
        </p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {(user?.name || "U")
            .slice(0, 1)
            .toUpperCase()}
        </div>

        <div>
          <h2>{user?.name || "User"}</h2>

          <p className="muted">
            {user?.email || "No email"}
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <User size={20} />

          <div>
            <strong>Full name</strong>
            <span>{user?.name || "Not set"}</span>
          </div>
        </div>

        <div className="settings-card">
          <Mail size={20} />

          <div>
            <strong>Email</strong>
            <span>{user?.email || "Not set"}</span>
          </div>
        </div>

        <div className="settings-card">
          <Building2 size={20} />

          <div>
            <strong>Department</strong>
            <span>
              {user?.department || "Not assigned"}
            </span>
          </div>
        </div>

        <div className="settings-card">
          <ShieldCheck size={20} />

          <div>
            <strong>Account role</strong>
            <span>
              {user?.role || "employee"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}