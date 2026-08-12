import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, Lock, Mail, User, Building } from "lucide-react";
import { validateKUEmail, DEPARTMENTS } from "../firebase/services";

export default function AuthModal({ isOpen, onClose, onLogin, onSignUp }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[1] || "School of Business");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isKUEmail = validateKUEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup" && !isKUEmail) {
      setError("Please use a valid Kenyatta University email address (@ku.ac.ke or @students.ku.ac.ke).");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await onLogin(email, password);
        if (res.error) setError(res.error);
        else onClose();
      } else {
        const res = await onSignUp(email, password, displayName, department);
        if (res.error) setError(res.error);
        else onClose();
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin("kamau.a@students.ku.ac.ke", "demo1234");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>
              {mode === "login" ? "Welcome Back to KU Hub" : "Create KU Student Account"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {mode === "login"
                ? "Sign in to upload, bookmark, and upvote study materials."
                : "Join the KU student community to share notes and past papers."}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* KU Email Domain Banner */}
        <div className="domain-notice">
          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>KU Email Verification:</strong> For full verified uploader status, use your official university email ending in <code>@students.ku.ac.ke</code> or <code>@ku.ac.ke</code>.
          </div>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            background: "rgba(15, 23, 42, 0.6)",
            padding: "4px",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === "signup" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "var(--radius-sm)",
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "1rem"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name / Display Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="e.g. Alex Kamau"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={mode === "signup"}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">University Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
              <input
                type="email"
                className="form-input"
                style={{
                  paddingLeft: "2.75rem",
                  borderColor: email
                    ? isKUEmail
                      ? "#10b981"
                      : "rgba(245, 158, 11, 0.5)"
                    : undefined
                }}
                placeholder="name.surname@students.ku.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {email && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  marginTop: "0.35rem",
                  fontSize: "0.78rem",
                  color: isKUEmail ? "#34d399" : "#f59e0b"
                }}
              >
                {isKUEmail ? (
                  <>
                    <CheckCircle size={13} /> Verified Kenyatta University Email Domain
                  </>
                ) : (
                  <>
                    <AlertTriangle size={13} /> Standard Email (Prefer @students.ku.ac.ke for uploader badge)
                  </>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: "2.75rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">School / Department</label>
              <div style={{ position: "relative" }}>
                <Building
                  size={16}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <select
                  className="form-select"
                  style={{ paddingLeft: "2.75rem" }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.filter((d) => d !== "All Departments").map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={handleDemoLogin}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", color: "var(--ku-gold)" }}
          >
            ⚡ Quick Demo Sign In as KU Student
          </button>
        </div>
      </div>
    </div>
  );
}
