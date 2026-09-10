import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Ship,
  ArrowRight,
} from "lucide-react";

import multimodal from "../assets/multimodal.jpeg";

import API from "../services/api";
import "./Login.css"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const user = response.data.user;

     
      onLogin(user);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-brand">
            <div className="brand-mark">
             <img
    src={multimodal}
    alt="Multimodal Cargo and Shipping"
    className="company-logo"
  />
</div>
            

            <div>
              <strong>MULTIMODAL CARGO AND SHIPPING</strong>
              <span>Company Email System</span>
            </div>
          </div>

          <div className="login-hero">
            <span className="eyebrow">
              SECURE BUSINESS COMMUNICATION
            </span>

            <h1>
              Keep your cargo operations
              <br />
              <span>connected.</span>
            </h1>

            <p>
              A professional company mailbox for
              managing shipping communications,
              clients, agents and cargo operations.
            </p>
          </div>

          <div className="login-features">
            <span>✓ Secure company email</span>
            <span>✓ Shared mailbox</span>
            <span>✓ Employee communication</span>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand">
            <div className="brand-mark">
              <Mail size={23} />
            </div>

            <strong>CargoMail</strong>
          </div>

          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h2>Sign in to your mailbox</h2>

          <p className="muted">
            Use your company email credentials
            to continue.
          </p>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label>Email address</label>

            <div className="input-icon">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@cargocompany.com"
              />
            </div>

            <label>Password</label>

            <div className="input-icon">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="login-footer">
            CargoMail • Secure Company Communication
          </p>
        </div>
      </div>
    </div>
  );
}