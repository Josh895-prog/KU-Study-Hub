import React from "react";
import { BookOpen, Upload, User, LogIn, LogOut, Compass, Grid } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  onOpenUploadModal,
  onLogout
}) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-logo" onClick={() => setActiveTab("browse")}>
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div className="brand-text-wrapper">
            <div className="brand-name">
              KU <span>HUB</span>
            </div>
            <div className="brand-subtitle">Kenyatta University Resources</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            <Compass size={17} />
            <span>Browse Resources</span>
          </button>

          <button
            className={`nav-item ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <Grid size={17} />
            <span>Courses Directory</span>
          </button>

          {currentUser && (
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={17} />
              <span>My Profile</span>
            </button>
          )}
        </nav>

        <div className="nav-actions">
          <button className="btn btn-accent btn-sm" onClick={onOpenUploadModal}>
            <Upload size={16} />
            <span>Upload Resource</span>
          </button>

          {currentUser ? (
            <div className="user-pill" onClick={() => setActiveTab("profile")}>
              <div className="user-avatar">
                {currentUser.displayName
                  ? currentUser.displayName.charAt(0).toUpperCase()
                  : currentUser.email.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>
                {currentUser.displayName || currentUser.email.split("@")[0]}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                title="Log Out"
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  marginLeft: "0.25rem",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuthModal}>
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
