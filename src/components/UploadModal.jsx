import React, { useState } from "react";
import { X, UploadCloud, File, AlertCircle } from "lucide-react";
import { DEPARTMENTS, RESOURCE_TYPES } from "../firebase/services";

export default function UploadModal({
  isOpen,
  onClose,
  courses,
  currentUser,
  onUploadSubmit,
  onOpenAuthModal
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState(courses[0]?.code || "BBA 310");
  const [department, setDepartment] = useState(courses[0]?.department || "School of Business");
  const [resourceType, setResourceType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-update department when course code changes
  const handleCourseChange = (selectedCode) => {
    setCourseCode(selectedCode);
    const matched = courses.find((c) => c.code === selectedCode);
    if (matched) {
      setDepartment(matched.department);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        // Auto fill title from filename if empty
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    if (!title || !courseCode) {
      setError("Please provide a title and select a course code.");
      return;
    }

    setLoading(true);

    try {
      const res = await onUploadSubmit({
        title,
        description,
        courseCode,
        department,
        resourceType,
        file,
        currentUser
      });

      if (res?.error) {
        setError(res.error);
      } else {
        // Reset form & close
        setTitle("");
        setDescription("");
        setFile(null);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to upload resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>
              Upload Study Resource
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Share notes, past papers, or assignments to assist fellow KU students.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!currentUser ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <AlertCircle size={48} color="var(--ku-gold)" style={{ marginBottom: "1rem" }} />
            <h3 style={{ marginBottom: "0.5rem" }}>Authentication Required</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              You must be signed in to upload study resources.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
            >
              Sign In / Create Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            {/* File Drop Zone */}
            <div className="form-group">
              <label className="form-label">Attachment File (PDF, DOCX, Image)</label>
              <label htmlFor="file-upload-input" className="file-drop-zone">
                <UploadCloud size={36} color="var(--ku-gold)" style={{ marginBottom: "0.5rem" }} />
                {file ? (
                  <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.92rem" }}>
                    <File size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, color: "#ffffff", marginBottom: "0.2rem" }}>
                      Click to choose or drag & drop file
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Supports PDF, DOCX, PNG, JPG (Up to 25MB)
                    </div>
                  </>
                )}
                <input
                  id="file-upload-input"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                />
              </label>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Resource Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BBA 310 End of Semester Exam 2024 with Solutions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Course Code & Resource Type Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Course Code *</label>
                <select
                  className="form-select"
                  value={courseCode}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Type *</label>
                <select
                  className="form-select"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                >
                  {RESOURCE_TYPES.filter((t) => t !== "All Types").map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">School / Department</label>
              <select
                className="form-select"
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

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description / Summary (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add brief details, topics covered, or notes regarding this study material..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Publish Resource"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
