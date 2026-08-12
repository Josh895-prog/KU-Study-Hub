import React from "react";
import { ThumbsUp, Download, Calendar, User, FileText, Trash2, CheckCircle2 } from "lucide-react";

export default function ResourceCard({
  resource,
  currentUser,
  onUpvote,
  onDelete,
  onSelectCourse
}) {
  const {
    id,
    title,
    description,
    courseCode,
    department,
    resourceType,
    fileUrl,
    fileName,
    fileSize,
    uploaderName,
    uploaderEmail,
    uploaderId,
    upvotesCount = 0,
    upvotedBy = [],
    createdAt
  } = resource;

  const hasUpvoted = currentUser ? upvotedBy.includes(currentUser.uid) : false;
  const isOwner = currentUser && (currentUser.uid === uploaderId || currentUser.email === uploaderEmail);

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return "Recently";
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case "Notes":
        return "badge-Notes";
      case "Past Paper":
        return "badge-PastPaper";
      case "Assignment":
        return "badge-Assignment";
      default:
        return "badge-Other";
    }
  };

  const isKUDomain = uploaderEmail && (uploaderEmail.endsWith("@ku.ac.ke") || uploaderEmail.endsWith("@students.ku.ac.ke"));

  return (
    <div className="resource-card">
      <div>
        <div className="card-header">
          <span
            className="course-chip"
            onClick={() => onSelectCourse && onSelectCourse(courseCode)}
            style={{ cursor: "pointer" }}
            title="Filter by this course code"
          >
            {courseCode}
          </span>
          <span className={`type-badge ${getBadgeClass(resourceType)}`}>
            {resourceType}
          </span>
        </div>

        <h3 className="card-title">{title}</h3>

        {description && <p className="card-description">{description}</p>}

        <div className="card-meta">
          <div className="meta-item">
            <User size={13} color="var(--ku-gold)" />
            <span>
              Uploaded by <strong>{uploaderName || "KU Student"}</strong>
            </span>
            {isKUDomain && (
              <CheckCircle2
                size={13}
                color="#34d399"
                title="Verified KU Student Domain"
                style={{ marginLeft: "2px" }}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%"
            }}
          >
            <div className="meta-item">
              <Calendar size={13} />
              <span>{formatDate(createdAt)}</span>
            </div>

            <div className="meta-item">
              <FileText size={13} />
              <span>{fileSize || "1.2 MB"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button
          className={`upvote-btn ${hasUpvoted ? "upvoted" : ""}`}
          onClick={() => onUpvote(id)}
          title={currentUser ? "Mark as helpful / upvote" : "Sign in to upvote"}
        >
          <ThumbsUp size={15} fill={hasUpvoted ? "var(--ku-gold)" : "none"} />
          <span>{upvotesCount}</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="btn btn-secondary btn-sm"
              style={{ color: "#ef4444", padding: "0.45rem" }}
              title="Delete resource"
            >
              <Trash2 size={15} />
            </button>
          )}

          <a
            href={fileUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName || `${courseCode}_resource`}
            className="btn btn-primary btn-sm"
            style={{ textDecoration: "none" }}
          >
            <Download size={14} />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
}
