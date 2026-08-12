import React from "react";
import { BookOpen, Folder, ArrowRight } from "lucide-react";

export default function CourseCard({ course, resourceCount = 0, onSelect }) {
  return (
    <div
      className="resource-card"
      style={{ cursor: "pointer", transition: "var(--transition-normal)" }}
      onClick={() => onSelect(course.code)}
    >
      <div>
        <div className="card-header" style={{ marginBottom: "0.6rem" }}>
          <span className="course-chip">{course.code}</span>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-full)"
            }}
          >
            {course.department}
          </span>
        </div>

        <h3 className="card-title" style={{ fontSize: "1.1rem" }}>
          {course.name}
        </h3>

        {course.description && (
          <p className="card-description" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
            {course.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-color)",
          marginTop: "0.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "var(--ku-gold)" }}>
          <Folder size={14} />
          <span>{resourceCount} Resource{resourceCount !== 1 ? "s" : ""} Available</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", fontWeight: 600, color: "#ffffff" }}>
          <span>Explore</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}
