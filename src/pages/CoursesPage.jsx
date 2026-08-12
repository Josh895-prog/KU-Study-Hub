import React, { useState, useMemo } from "react";
import { Search, Grid, GraduationCap } from "lucide-react";
import CourseCard from "../components/CourseCard";
import { DEPARTMENTS } from "../firebase/services";

export default function CoursesPage({
  courses,
  resources,
  onSelectCourse
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  // Calculate resource count per course
  const courseResourceCounts = useMemo(() => {
    const counts = {};
    resources.forEach((r) => {
      if (r.courseCode) {
        counts[r.courseCode] = (counts[r.courseCode] || 0) + 1;
      }
    });
    return counts;
  }, [resources]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.department.toLowerCase().includes(term);

      const matchesDept =
        selectedDept === "All Departments" || c.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [courses, searchTerm, selectedDept]);

  return (
    <div className="courses-page">
      <div className="hero-banner" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ku-gold)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          <GraduationCap size={18} /> Course Directory
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Kenyatta University Academic Courses
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.98rem", maxWidth: "700px" }}>
          Select any course to view all attached past papers, lecture notes, formula sheets, and assignment solutions uploaded by students.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-box-container" style={{ flex: 1, minWidth: "260px" }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            style={{ padding: "0.65rem 1rem 0.65rem 2.8rem", fontSize: "0.92rem" }}
            placeholder="Search by course code (e.g. BBA 310) or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="select-control"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#ffffff" }}>
          Active Courses ({filteredCourses.length})
        </h2>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="resources-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              resourceCount={courseResourceCounts[course.code] || course.resourceCount || 0}
              onSelect={onSelectCourse}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Grid className="empty-icon" />
          <h3 style={{ fontSize: "1.25rem", color: "#ffffff" }}>No Courses Found</h3>
          <p style={{ fontSize: "0.9rem" }}>No course codes match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
