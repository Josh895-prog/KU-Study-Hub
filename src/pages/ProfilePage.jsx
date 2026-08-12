import React from "react";
import { User, CheckCircle2, Upload, ThumbsUp, FileText, Trash2, Calendar, ShieldCheck } from "lucide-react";
import ResourceCard from "../components/ResourceCard";

export default function ProfilePage({
  currentUser,
  resources,
  onUpvote,
  onDelete,
  onOpenUpload,
  onOpenAuth
}) {
  if (!currentUser) {
    return (
      <div className="empty-state" style={{ marginTop: "2rem" }}>
        <User className="empty-icon" />
        <h2 style={{ color: "#ffffff", marginBottom: "0.5rem" }}>Profile Access Required</h2>
        <p style={{ maxWidth: "400px", margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
          Please sign in to view your uploaded study resources and account statistics.
        </p>
        <button className="btn btn-primary" onClick={onOpenAuth}>
          Sign In / Register
        </button>
      </div>
    );
  }

  // Filter resources uploaded by this user
  const userResources = resources.filter(
    (r) => r.uploaderId === currentUser.uid || r.uploaderEmail === currentUser.email
  );

  // Calculate total upvotes earned across user's uploads
  const totalUpvotesEarned = userResources.reduce(
    (sum, r) => sum + (r.upvotesCount || 0),
    0
  );

  const isKUEmail =
    currentUser.email &&
    (currentUser.email.endsWith("@ku.ac.ke") || currentUser.email.endsWith("@students.ku.ac.ke"));

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div
        className="hero-banner"
        style={{
          background: "linear-gradient(135deg, rgba(128, 0, 0, 0.6) 0%, rgba(21, 28, 44, 0.95) 100%)",
          padding: "2rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--ku-maroon-light), var(--ku-gold))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "800",
              color: "#ffffff",
              boxShadow: "var(--shadow-glow)"
            }}
          >
            {currentUser.displayName
              ? currentUser.displayName.charAt(0).toUpperCase()
              : currentUser.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.75rem" }}>
                {currentUser.displayName || currentUser.email.split("@")[0]}
              </h1>
              {isKUEmail && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.2rem 0.6rem",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.78rem",
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={14} /> Verified KU Student
                </span>
              )}
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              {currentUser.email} • {currentUser.department || "Kenyatta University"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff" }}>
              {userResources.length}
            </div>
            <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
              Uploaded Resources
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(245, 158, 11, 0.15)",
              color: "var(--ku-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ThumbsUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff" }}>
              {totalUpvotesEarned}
            </div>
            <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
              Helpful Upvotes Earned
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Resources Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem"
        }}
      >
        <h2 style={{ fontSize: "1.3rem", color: "#ffffff" }}>My Uploaded Resources</h2>
        <button className="btn btn-accent btn-sm" onClick={onOpenUpload}>
          <Upload size={15} />
          <span>Upload New Resource</span>
        </button>
      </div>

      {userResources.length > 0 ? (
        <div className="resources-grid">
          {userResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              currentUser={currentUser}
              onUpvote={onUpvote}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Upload className="empty-icon" />
          <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.5rem" }}>
            No Uploaded Resources Yet
          </h3>
          <p style={{ maxWidth: "450px", margin: "0 auto 1.5rem", fontSize: "0.88rem" }}>
            Share past papers, class notes, or assignments to build your profile and assist fellow students across KU campus.
          </p>
          <button className="btn btn-primary" onClick={onOpenUpload}>
            Upload Your First Resource
          </button>
        </div>
      )}
    </div>
  );
}
