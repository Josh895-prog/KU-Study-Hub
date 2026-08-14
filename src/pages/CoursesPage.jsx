import React, { useState, useMemo } from "react";
import { Search, Grid, GraduationCap, ArrowLeft, FolderOpen, BookOpenText } from "lucide-react";
import CourseCard from "../components/CourseCard";
import { DEPARTMENTS } from "../firebase/services";
import { SCHOOLS, COURSES_BY_SCHOOL, UNITS_BY_COURSE } from "../data/mockData";

export default function CoursesPage({
  courses,
  resources,
  onSelectCourse
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const courseResourceCounts = useMemo(() => {
    const counts = {};
    resources.forEach((r) => {
      if (r.courseCode && r.status !== "pending") {
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

  const selectedSchool = SCHOOLS.find((school) => school.id === selectedSchoolId) || null;
  const selectedSchoolCourses = selectedSchool ? COURSES_BY_SCHOOL[selectedSchool.id] || [] : [];
  const selectedCourse = selectedSchoolCourses.find((course) => course.id === selectedCourseId) || null;
  const courseUnitGroups = selectedCourse ? UNITS_BY_COURSE[selectedCourse.id] || {} : {};
  const defaultUnitYears = ["First Year", "Second Year", "Third Year", "Fourth Year"];
  const yearGroups = defaultUnitYears.reduce((acc, year) => {
    acc[year] = courseUnitGroups[year] || [];
    return acc;
  }, {});
  const electives = courseUnitGroups.electives || [];

  const schoolResources = selectedSchool
    ? resources.filter((resource) => resource.department === selectedSchool.name && resource.status !== "pending")
    : [];

  const renderSchoolGrid = () => (
    <>
      <div className="hero-banner" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ku-gold)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          <GraduationCap size={18} /> School Directory
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          Kenyatta University Academic Schools
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.98rem", maxWidth: "700px" }}>
          Choose a school to view the programmes offered and their unit structure for each course.
        </p>
      </div>

      <div className="resources-grid">
        {SCHOOLS.map((school) => (
          <div
            key={school.id}
            className="resource-card"
            onClick={() => {
              setSelectedSchoolId(school.id);
              setSelectedCourseId(null);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="card-header" style={{ marginBottom: "0.8rem" }}>
              <span className="course-chip" style={{ background: school.gradient }}>{school.icon}</span>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                {school.shortName}
              </span>
            </div>
            <h3 className="card-title" style={{ fontSize: "1.08rem" }}>{school.name}</h3>
            <p className="card-description" style={{ fontSize: "0.82rem", marginTop: "0.4rem" }}>
              {COURSES_BY_SCHOOL[school.id]?.length || 0} programmes available
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--ku-gold)", fontWeight: 600 }}>Open school</span>
              <ArrowLeft size={15} style={{ transform: "rotate(180deg)" }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderCourseGrid = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSchoolId(null)}>
          <ArrowLeft size={15} />
          <span>Back to schools</span>
        </button>
        <div style={{ color: "var(--ku-gold)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
          {selectedSchool?.name}
        </div>
      </div>

      <div className="hero-banner" style={{ padding: "1.5rem 2rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>Programmes Offered</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Select a programme to view the units and related study materials in that course.
        </p>
      </div>

      <div className="resources-grid">
        {selectedSchoolCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={{ ...course, department: selectedSchool.name }}
            resourceCount={courseResourceCounts[course.name] || courseResourceCounts[course.id] || 0}
            onSelect={() => setSelectedCourseId(course.id)}
          />
        ))}
      </div>
    </>
  );

  const renderCourseDetail = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCourseId(null)}>
          <ArrowLeft size={15} />
          <span>Back to programmes</span>
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSchoolId(null)}>
          <Grid size={15} />
          <span>All schools</span>
        </button>
      </div>

      <div className="hero-banner" style={{ padding: "1.5rem 2rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ku-gold)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
          <BookOpenText size={16} /> {selectedSchool?.name}
        </div>
        <h2 style={{ fontSize: "1.8rem", margin: "0.5rem 0" }}>{selectedCourse?.name}</h2>
        <p style={{ color: "var(--text-muted)" }}>
          Units are added by the admin when the data is ready. Approved past papers and notes for this programme will appear below once uploaded.
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.75rem" }}>Units Offered</h3>

        {defaultUnitYears.map((year) => (
          <div key={year} style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "1rem", color: "var(--ku-gold)", marginBottom: "0.75rem" }}>{year}</h4>
            {yearGroups[year].length > 0 ? (
              <div className="resources-grid">
                {yearGroups[year].map((unit) => (
                  <div key={unit.id} className="resource-card">
                    <div className="card-header" style={{ marginBottom: "0.6rem" }}>
                      <span className="course-chip">{unit.code || "Unit"}</span>
                    </div>
                    <h4 className="card-title" style={{ fontSize: "1rem" }}>{unit.name}</h4>
                    {unit.description && <p className="card-description">{unit.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "1rem" }}>
                <FolderOpen className="empty-icon" />
                <h3 style={{ fontSize: "1rem", color: "#ffffff" }}>No units provided yet</h3>
              </div>
            )}
          </div>
        ))}

        {electives.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4 style={{ fontSize: "1rem", color: "var(--ku-gold)", marginBottom: "0.75rem" }}>Electives</h4>
            <div className="resources-grid">
              {electives.map((unit) => (
                <div key={unit.id || unit.name} className="resource-card">
                  <div className="card-header" style={{ marginBottom: "0.6rem" }}>
                    <span className="course-chip">{unit.code || "Elective"}</span>
                  </div>
                  <h4 className="card-title" style={{ fontSize: "1rem" }}>{unit.name}</h4>
                  {unit.description && <p className="card-description">{unit.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.75rem" }}>Approved Past Papers & Materials</h3>
        {schoolResources.length > 0 ? (
          <div className="resources-grid">
            {schoolResources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className="card-header">
                  <span className="course-chip">{resource.courseCode}</span>
                  <span className="type-badge badge-Notes">{resource.resourceType}</span>
                </div>
                <h4 className="card-title" style={{ fontSize: "1rem" }}>{resource.title}</h4>
                <p className="card-description">{resource.description}</p>
                <div style={{ marginTop: "1rem" }}>
                  <a href={resource.fileUrl || "#"} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    Open resource
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Grid className="empty-icon" />
            <h3 style={{ fontSize: "1.2rem", color: "#ffffff" }}>No Approved Materials Yet</h3>
            <p style={{ fontSize: "0.88rem" }}>Upload a resource to start building the past paper library for this programme.</p>
          </div>
        )}
      </div>
    </>
  );

  if (selectedSchool && selectedCourse) {
    return <div className="courses-page">{renderCourseDetail()}</div>;
  }

  if (selectedSchool) {
    return <div className="courses-page">{renderCourseGrid()}</div>;
  }

  return (
    <div className="courses-page">
      <div className="filter-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="search-box-container" style={{ flex: 1, minWidth: "260px" }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            style={{ padding: "0.65rem 1rem 0.65rem 2.8rem", fontSize: "0.92rem" }}
            placeholder="Search by course code or title..."
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
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#ffffff" }}>Active Courses ({filteredCourses.length})</h2>
      </div>

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

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.2rem", color: "#ffffff", marginBottom: "0.75rem" }}>Browse by School</h3>
        {renderSchoolGrid()}
      </div>
    </div>
  );
}
