import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import UploadModal from "./components/UploadModal";
import Toast from "./components/Toast";
import BrowsePage from "./pages/BrowsePage";
import CoursesPage from "./pages/CoursesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  getCourses,
  getResources,
  signInUser,
  signUpUser,
  logoutUser,
  uploadResourceService,
  upvoteResourceService,
  deleteResourceService,
  approveResourceService,
  isFirebaseConfigured
} from "./firebase/services";

export default function App() {
  const [activeTab, setActiveTab] = useState("browse"); // 'browse', 'courses', 'profile'
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial data and restore session
  useEffect(() => {
    async function loadData() {
      const courseList = await getCourses();
      setCourses(courseList);

      const resourceList = await getResources();
      setResources(resourceList);

      // Check stored mock or Firebase session
      const storedUser = localStorage.getItem("ku_hub_current_user");
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
      // Ensure page loads at top (fix scroll-to-bottom behavior)
      try {
        window.scrollTo({ top: 0, behavior: "auto" });
      } catch (e) {
        // ignore
      }
      // If URL is /admin, open admin tab
      if (window.location && window.location.pathname === "/admin") {
        setActiveTab("admin");
      }
    }
    loadData();
  }, []);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await signInUser(email, password);
    if (res.user) {
      setCurrentUser(res.user);
      showToast(`Welcome back, ${res.user.displayName || res.user.email}!`, "success");
      // Redirect based on role
      if (res.user.role === "admin" || res.user.role === "superAdmin") {
        setActiveTab("admin");
        navigate("/admin");
      } else {
        setActiveTab("profile");
        navigate("/profile");
      }
    }
    return res;
  };

  const handleSignUp = async (email, password, displayName, department) => {
    const res = await signUpUser(email, password, displayName, department);
    if (res.user) {
      setCurrentUser(res.user);
      showToast("Account created successfully! Welcome to KU Hub.", "success");
      setActiveTab("profile");
      navigate("/profile");
    }
    return res;
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast("Signed out successfully.", "info");
    if (activeTab === "profile") {
      setActiveTab("browse");
    }
  };

  // Upvote Handler
  const handleUpvote = async (resourceId) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast("Please sign in to upvote study resources.", "info");
      return;
    }

    const { resources: updatedList, updatedResource } = await upvoteResourceService(
      resourceId,
      currentUser.uid,
      resources
    );

    setResources(updatedList);

    if (updatedResource) {
      const hasUpvoted = updatedResource.upvotedBy.includes(currentUser.uid);
      showToast(
        hasUpvoted
          ? `Upvoted "${updatedResource.title}"! (+1 Helpful)`
          : `Removed upvote for "${updatedResource.title}".`,
        hasUpvoted ? "success" : "info"
      );
    }
  };

  // Upload Handler
  const handleUploadSubmit = async (uploadData) => {
    const { resource, error } = await uploadResourceService(uploadData);
    if (error) {
      return { error };
    }

    setResources((prev) => [resource, ...prev]);
    showToast(
      `Submitted "${resource.title}" for admin approval. It will be visible after review.`,
      "success"
    );

    return { resource };
  };

  const handleApproveResource = async (resourceId) => {
    const result = await approveResourceService(resourceId, currentUser);
    if (!result?.success) {
      showToast(result?.error || "Unable to approve this material.", "error");
      return;
    }

    const approvedResource = resources.find((resource) => resource.id === resourceId);

    setResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId
          ? { ...resource, status: "approved", approvedAt: new Date().toISOString() }
          : resource
      )
    );

    if (approvedResource?.courseCode) {
      setCourses((prev) =>
        prev.map((course) =>
          course.code === approvedResource.courseCode
            ? { ...course, resourceCount: (course.resourceCount || 0) + 1 }
            : course
        )
      );
    }

    showToast("Material approved and published to students.", "success");
  };

  // Delete Resource Handler
  const handleDeleteResource = async (resourceId) => {
    const target = resources.find((r) => r.id === resourceId);
    if (!window.confirm(`Are you sure you want to delete "${target?.title || "this resource"}"?`)) {
      return;
    }

    const res = await deleteResourceService(resourceId, resources);
    if (res.success) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      showToast("Resource deleted successfully.", "info");
    }
  };

  // Select Course Handler (Navigates to Browse page with course code filter)
  const handleSelectCourseCode = (code) => {
    setSelectedCourseFilter(code);
    setActiveTab("browse");
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUploadModal={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            showToast("Please sign in to upload resources.", "info");
          } else {
            setIsUploadModalOpen(true);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Page Area with routes */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<BrowsePage
            resources={resources}
            courses={courses}
            currentUser={currentUser}
            onUpvote={handleUpvote}
            onDelete={handleDeleteResource}
            selectedCourseFilter={selectedCourseFilter}
            setSelectedCourseFilter={setSelectedCourseFilter}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />} />

          <Route path="/courses" element={<CoursesPage
            courses={courses}
            resources={resources}
            onSelectCourse={handleSelectCourseCode}
          />} />

          <Route path="/profile" element={<ProfilePage
            currentUser={currentUser}
            resources={resources}
            onUpvote={handleUpvote}
            onDelete={handleDeleteResource}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onApproveResource={handleApproveResource}
          />} />

          <Route path="/admin" element={
            <ProtectedRoute currentUser={currentUser} allowedRoles={["admin","superAdmin"]}>
              <AdminPage currentUser={currentUser} />
            </ProtectedRoute>
          } />

        </Routes>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          background: "var(--bg-card)",
          marginTop: "auto"
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ marginBottom: "0.5rem", fontWeight: 600, color: "#ffffff" }}>
            Kenyatta University Study Resource Hub
          </p>
          <p>
            Designed for KU Students • Supports Firebase Authentication, Firestore & Cloud Storage
          </p>
          {!isFirebaseConfigured() && (
            <p style={{ color: "var(--ku-gold)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              ⚡ Interactive Fallback Mode Active (Replace Firebase config credentials in <code>src/firebase/config.js</code> to connect live database)
            </p>
          )}
        </div>
      </footer>

      {/* Modals & Toasts */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        courses={courses}
        currentUser={currentUser}
        onUploadSubmit={handleUploadSubmit}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
