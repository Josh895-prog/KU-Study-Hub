import React, { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, BookOpen, X, Sparkles } from "lucide-react";
import ResourceCard from "../components/ResourceCard";
import { DEPARTMENTS, RESOURCE_TYPES } from "../firebase/services";

export default function BrowsePage({
  resources,
  courses,
  currentUser,
  onUpvote,
  onDelete,
  selectedCourseFilter,
  setSelectedCourseFilter,
  onOpenUpload
}) {
  const [searchTerm, setSearchTerm] = useState(selectedCourseFilter || "");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("upvotes"); // 'upvotes', 'newest', 'title'

  // Update search input when course filter changes from external component
  React.useEffect(() => {
    if (selectedCourseFilter) {
      setSearchTerm(selectedCourseFilter);
    }
  }, [selectedCourseFilter]);

  const filteredResources = useMemo(() => {
    return resources
      .filter((res) => {
        if (res.status === "pending") return false;

        // Keyword Search (matches Title, Description, Course Code, or Uploader)
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          res.title?.toLowerCase().includes(term) ||
          res.courseCode?.toLowerCase().includes(term) ||
          res.description?.toLowerCase().includes(term) ||
          res.uploaderName?.toLowerCase().includes(term);

        // Department Filter
        const matchesDept =
          selectedDept === "All Departments" || res.department === selectedDept;

        // Resource Type Filter
        const matchesType =
          selectedType === "All Types" || res.resourceType === selectedType;

        return matchesSearch && matchesDept && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "upvotes") {
          return (b.upvotesCount || 0) - (a.upvotesCount || 0);
        } else if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [resources, searchTerm, selectedDept, selectedType, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDept("All Departments");
    setSelectedType("All Types");
    setSelectedCourseFilter("");
  };

  const isFiltered = searchTerm || selectedDept !== "All Departments" || selectedType !== "All Types";

  return (
    <div className="browse-page">
      {/* Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-header">
          <div className="ku-badge">
            <Sparkles size={14} /> Kenyatta University Academic Hub
          </div>
          <h1 className="hero-title">
            Find & Share Verified KU Study Resources
          </h1>
          <p className="hero-subtitle">
            Access past examination papers, lecture notes, and assignment solutions contributed by fellow Kenyatta University students.
          </p>

          {/* Search Box */}
          <div className="search-box-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by course code (e.g. BBA 310, SPH 318), title, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCourseFilter("");
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popular courses removed per request */}

      {/* Filter & Sort Control Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--ku-gold)", fontWeight: 600, fontSize: "0.88rem" }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

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

          <select
            className="select-control"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
              style={{ color: "#ef4444" }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="filter-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <SlidersHorizontal size={15} />
            <span>Sort By:</span>
          </div>
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="upvotes">Most Helpful (Upvotes)</option>
            <option value="newest">Newest Uploads</option>
            <option value="title">Course / Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "#ffffff" }}>
          {isFiltered ? `Search Results (${filteredResources.length})` : `All Study Resources (${filteredResources.length})`}
        </h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Showing {filteredResources.length} of {resources.length} materials
        </span>
      </div>

      {/* Resources Card Grid */}
      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              currentUser={currentUser}
              onUpvote={onUpvote}
              onDelete={onDelete}
              onSelectCourse={(code) => setSearchTerm(code)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3 style={{ fontSize: "1.3rem", color: "#ffffff", marginBottom: "0.5rem" }}>
            No Resources Found
          </h3>
          <p style={{ maxWidth: "450px", margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
            {searchTerm
              ? `We couldn't find any resources matching "${searchTerm}". Try adjusting your query or filters.`
              : "No study resources match the selected criteria."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Search & Filters
            </button>
            <button className="btn btn-accent" onClick={onOpenUpload}>
              Upload First Resource for this Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
